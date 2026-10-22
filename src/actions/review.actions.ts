'use server';

import {
  BookingStatus,
  ReviewDisplayFormat,
  ReviewModerationStatus,
} from '@prisma/client';
import { z } from 'zod';
import { isDatabaseReachableFast, prisma } from '@/lib/prisma';
import {
  ActionResult,
  verifyAdminPinOrThrow,
} from '@/actions/availability.actions';

export interface PublicReviewDTO {
  id: string;
  rating: number;
  comment: string;
  publicDisplayName: string;
  serviceNameSnap: string;
  submittedAtIso: string;
}

const getPublicReviewsSchema = z
  .object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  })
  .strict();

/**
 * Récupère les avis clientes validés (`APPROVED`) avec pagination stricte et moyenne globale.
 */
export async function getPublicApprovedReviewsAction(
  rawInput?: Partial<z.infer<typeof getPublicReviewsSchema>>
): Promise<
  ActionResult<{
    data: PublicReviewDTO[];
    stats: { averageRating: number; totalApproved: number };
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>
> {
  try {
    const input = getPublicReviewsSchema.parse(rawInput ?? {});
    const skip = (input.page - 1) * input.limit;

    const whereApproved = {
      moderationStatus: ReviewModerationStatus.APPROVED,
      consentGiven: true,
      rating: { not: null },
      comment: { not: null },
    } as const;

    const [total, aggregate, rows] = await Promise.all([
      prisma.review.count({ where: whereApproved }),
      prisma.review.aggregate({
        where: whereApproved,
        _avg: { rating: true },
      }),
      prisma.review.findMany({
        where: whereApproved,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: input.limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          publicDisplayName: true,
          serviceNameSnap: true,
          submittedAt: true,
          createdAt: true,
        },
      }),
    ]);

    const averageRating = aggregate._avg.rating
      ? Math.round(aggregate._avg.rating * 10) / 10
      : 5.0;

    return {
      success: true,
      data: {
        data: rows.map((r) => ({
          id: r.id,
          rating: r.rating ?? 5,
          comment: r.comment ?? '',
          publicDisplayName: r.publicDisplayName ?? 'Cliente vérifiée',
          serviceNameSnap: r.serviceNameSnap,
          submittedAtIso: (r.submittedAt ?? r.createdAt).toISOString(),
        })),
        stats: {
          averageRating,
          totalApproved: total,
        },
        meta: {
          total,
          page: input.page,
          limit: input.limit,
          totalPages: Math.max(1, Math.ceil(total / input.limit)),
        },
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de charger les avis clientes.';
    return { success: false, error: message };
  }
}

/**
 * Formate le nom public selon le choix de confidentialité de la cliente :
 * - FIRST_NAME : "Aïssatou"
 * - FIRST_NAME_INITIAL : "Aïssatou N."
 */
function buildPublicDisplayName(
  fullName: string,
  format: ReviewDisplayFormat
): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);

  const firstName = parts[0] ?? 'Cliente';
  const capitalizedFirst =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  if (format === ReviewDisplayFormat.FIRST_NAME || parts.length < 2) {
    return capitalizedFirst;
  }

  const lastPart = parts[parts.length - 1] ?? '';
  const initial = lastPart.charAt(0).toUpperCase();
  return initial ? `${capitalizedFirst} ${initial}.` : capitalizedFirst;
}

export interface ReviewInvitationDTO {
  token: string;
  clientFirstNamePreview: string;
  clientInitialPreview: string;
  serviceName: string;
  dateKey: string;
  alreadySubmitted: boolean;
  isExpired: boolean;
}

/**
 * Vérifie le jeton personnel d'avis (/avis/[token]).
 */
export async function getReviewInvitationByTokenAction(
  rawToken: string
): Promise<ActionResult<ReviewInvitationDTO>> {
  try {
    const token = z.string().trim().min(10).max(128).parse(rawToken);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }
    const now = new Date();

    const review = await prisma.review.findUnique({
      where: { token },
      include: {
        booking: {
          select: {
            clientName: true,
            dateKey: true,
            status: true,
          },
        },
      },
    });

    if (!review || review.booking.status !== BookingStatus.COMPLETED) {
      return {
        success: false,
        error:
          'Ce lien d’avis est invalide ou ne correspond pas à une prestation terminée.',
      };
    }

    const alreadySubmitted =
      review.moderationStatus !== ReviewModerationStatus.INVITED;
    const isExpired =
      !alreadySubmitted && review.expiresAt.getTime() < now.getTime();

    return {
      success: true,
      data: {
        token: review.token,
        clientFirstNamePreview: buildPublicDisplayName(
          review.booking.clientName,
          ReviewDisplayFormat.FIRST_NAME
        ),
        clientInitialPreview: buildPublicDisplayName(
          review.booking.clientName,
          ReviewDisplayFormat.FIRST_NAME_INITIAL
        ),
        serviceName: review.serviceNameSnap,
        dateKey: review.booking.dateKey,
        alreadySubmitted,
        isExpired,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Lien d’invitation d’avis invalide.';
    return { success: false, error: message };
  }
}

const submitReviewSchema = z
  .object({
    token: z.string().trim().min(10).max(128),
    rating: z.number().int().min(1).max(5),
    comment: z
      .string()
      .trim()
      .min(10, 'Merci d’écrire quelques mots sur ta prestation (10 caractères min).')
      .max(600, 'Le commentaire ne peut pas dépasser 600 caractères.'),
    displayFormat: z.nativeEnum(ReviewDisplayFormat),
    consentGiven: z.literal(true, {
      errorMap: () => ({
        message: 'Tu dois cocher la case d’accord avant d’envoyer ton avis.',
      }),
    }),
  })
  .strict();

// Détecte un numéro de téléphone ou une adresse e-mail publiés par erreur dans l'avis
const ACCIDENTAL_PII_REGEX =
  /(\+?\d[\d\s.-]{7,}\d)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

/**
 * Soumission du formulaire `/avis/[token]` par la cliente après sa prestation.
 */
export async function submitClientReviewAction(
  rawInput: z.infer<typeof submitReviewSchema>
): Promise<ActionResult<{ reviewId: string; publicDisplayName: string }>> {
  try {
    const input = submitReviewSchema.parse(rawInput);
    const now = new Date();

    if (ACCIDENTAL_PII_REGEX.test(input.comment)) {
      return {
        success: false,
        error:
          'Par sécurité pour ta vie privée, merci de ne pas inclure de numéro de téléphone ni d’adresse e-mail dans ton commentaire.',
      };
    }

    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }

    const existing = await prisma.review.findUnique({
      where: { token: input.token },
      include: {
        booking: {
          select: {
            clientName: true,
            status: true,
          },
        },
      },
    });

    if (!existing || existing.booking.status !== BookingStatus.COMPLETED) {
      return {
        success: false,
        error: 'Lien d’avis introuvable ou invalide.',
      };
    }

    if (existing.moderationStatus !== ReviewModerationStatus.INVITED) {
      return {
        success: false,
        error: 'Ton avis a déjà été enregistré pour cette prestation. Merci !',
      };
    }

    if (existing.expiresAt.getTime() < now.getTime()) {
      return {
        success: false,
        error: 'Ce lien d’invitation a expiré.',
      };
    }

    const publicDisplayName = buildPublicDisplayName(
      existing.booking.clientName,
      input.displayFormat
    );

    const updated = await prisma.review.update({
      where: { id: existing.id },
      data: {
        rating: input.rating,
        comment: input.comment,
        displayFormat: input.displayFormat,
        publicDisplayName,
        consentGiven: input.consentGiven,
        moderationStatus: ReviewModerationStatus.PENDING_MODERATION,
        submittedAt: now,
      },
      select: {
        id: true,
        publicDisplayName: true,
      },
    });

    return {
      success: true,
      data: {
        reviewId: updated.id,
        publicDisplayName: updated.publicDisplayName ?? publicDisplayName,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible d’enregistrer ton avis pour le moment.';
    return { success: false, error: message };
  }
}

const moderateReviewSchema = z
  .object({
    adminPin: z.string().min(1),
    reviewId: z.string().min(1),
    decision: z.enum(['APPROVED', 'REJECTED']),
    moderationNote: z.string().trim().max(240).optional(),
  })
  .strict();

/**
 * Back-Office (/admin) : Modération des avis (validation ou rejet en 1 clic).
 */
export async function moderateReviewAction(
  rawInput: z.infer<typeof moderateReviewSchema>
): Promise<ActionResult<{ reviewId: string; status: ReviewModerationStatus }>> {
  try {
    const input = moderateReviewSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }

    const nextStatus =
      input.decision === 'APPROVED'
        ? ReviewModerationStatus.APPROVED
        : ReviewModerationStatus.REJECTED;

    const updated = await prisma.review.update({
      where: { id: input.reviewId },
      data: {
        moderationStatus: nextStatus,
        moderatedAt: new Date(),
        moderationNote: input.moderationNote ?? null,
      },
      select: { id: true, moderationStatus: true },
    });

    return {
      success: true,
      data: {
        reviewId: updated.id,
        status: updated.moderationStatus,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de modérer cet avis.';
    return { success: false, error: message };
  }
}

const listAdminReviewsSchema = z
  .object({
    adminPin: z.string().min(1),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  })
  .strict();

export interface AdminReviewItemDTO {
  id: string;
  rating: number | null;
  comment: string | null;
  publicDisplayName: string | null;
  serviceNameSnap: string;
  moderationStatus: ReviewModerationStatus;
  submittedAtIso: string | null;
}

/**
 * Back-Office (/admin) : Liste paginée des avis soumis ou en attente de modération.
 */
export async function listAdminReviewsAction(
  rawInput: z.infer<typeof listAdminReviewsSchema>
): Promise<
  ActionResult<{
    data: AdminReviewItemDTO[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>
> {
  try {
    const input = listAdminReviewsSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }

    const skip = (input.page - 1) * input.limit;
    const whereClause = {
      moderationStatus: {
        in: [
          ReviewModerationStatus.PENDING_MODERATION,
          ReviewModerationStatus.APPROVED,
          ReviewModerationStatus.REJECTED,
        ],
      },
    };

    const [total, rows] = await Promise.all([
      prisma.review.count({ where: whereClause }),
      prisma.review.findMany({
        where: whereClause,
        orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: input.limit,
      }),
    ]);

    return {
      success: true,
      data: {
        data: rows.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          publicDisplayName: r.publicDisplayName,
          serviceNameSnap: r.serviceNameSnap,
          moderationStatus: r.moderationStatus,
          submittedAtIso: r.submittedAt ? r.submittedAt.toISOString() : null,
        })),
        meta: {
          total,
          page: input.page,
          limit: input.limit,
          totalPages: Math.max(1, Math.ceil(total / input.limit)),
        },
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de charger la liste des avis.';
    return { success: false, error: message };
  }
}

