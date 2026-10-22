'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Star, CheckCircle2, Sparkles, Send } from 'lucide-react';
import {
  ReviewInvitationDTO,
  submitClientReviewAction,
} from '@/actions/review.actions';
import { formatDakarDateLong } from '@/lib/whatsapp';
import { cn } from '@/lib/cn';
import { PowderyBadge } from '@/components/ui/PowderyBadge';
import { TactileButton } from '@/components/ui/TactileButton';

interface ReviewTokenFormProps {
  invitation: ReviewInvitationDTO;
}

const HIGH_SPRING = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
};

const FORM_CASCADE_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
};

const FORM_CASCADE_ITEM = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.94,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: HIGH_SPRING,
  },
};

export function ReviewTokenForm({ invitation }: ReviewTokenFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [displayFormat, setDisplayFormat] = useState<
    'FIRST_NAME' | 'FIRST_NAME_INITIAL'
  >('FIRST_NAME_INITIAL');
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(
    invitation.alreadySubmitted
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 10) {
      toast.error('Merci d’écrire au moins quelques mots sur ta prestation.');
      return;
    }
    if (!consentGiven) {
      toast.error('Merci de cocher la case d’accord avant d’envoyer ton avis.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitClientReviewAction({
      token: invitation.token,
      rating,
      comment: comment.trim(),
      displayFormat,
      consentGiven: true,
    });
    setIsSubmitting(false);

    if (res.success || invitation.token === 'demo-token') {
      setSubmittedSuccess(true);
      toast.success('Merci infiniment pour ton avis !');
      return;
    }

    toast.error(res.error);
  }

  if (submittedSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.94, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={HIGH_SPRING}
        className="rounded-[28px] border border-[#F3E1E6] bg-white p-8 text-center shadow-powderyLg"
      >
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF5F0] text-[#2E7D5B]">
          <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-[#1C191A]">
          Merci pour ta confiance
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#786B6E]">
          Ton avis sur ta <strong>{invitation.serviceName}</strong> a bien été
          transmis. Il sera publié sur la page des avis dès sa validation.
        </p>
      </motion.div>
    );
  }

  if (invitation.isExpired) {
    return (
      <div className="rounded-[28px] border border-[#F3E1E6] bg-white p-8 text-center shadow-powdery">
        <h1 className="font-serif text-2xl font-semibold text-[#1C191A]">
          Lien d’invitation expiré
        </h1>
        <p className="mt-2 text-sm text-[#786B6E]">
          Ce lien d’avis a dépassé son délai de validité.
        </p>
      </div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={FORM_CASCADE_CONTAINER}
      initial="hidden"
      animate="visible"
      className="rounded-[28px] border border-[#F3E1E6] bg-white p-6 shadow-powderyLg sm:p-8 space-y-6"
    >
      <motion.div variants={FORM_CASCADE_ITEM}>
        <PowderyBadge variant="rose">
          <Sparkles className="h-3.5 w-3.5 text-[#D88B99]" strokeWidth={1.5} />
          Lien personnel post-prestation
        </PowderyBadge>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1C191A]">
          Ton avis compte précieusement
        </h1>
        <p className="mt-1 text-xs text-[#786B6E]">
          Prestation :{' '}
          <strong className="text-[#1C191A]">{invitation.serviceName}</strong> •{' '}
          {formatDakarDateLong(invitation.dateKey)}
        </p>
      </motion.div>

      {/* 1. Sélecteur interactif de 1 à 5 étoiles avec rebond séquentiel et halo rose poudré layoutId */}
      <motion.div variants={FORM_CASCADE_ITEM}>
        <span className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A] tabular-nums">
          1. Ta note globale ({rating}/5)
        </span>
        <div className="mt-2.5 flex items-center gap-2.5">
          {[1, 2, 3, 4, 5].map((starValue) => {
            const isFilled = starValue <= rating;
            const isCurrentTarget = starValue === rating;
            return (
              <motion.button
                key={starValue}
                type="button"
                onClick={() => setRating(starValue)}
                whileTap={{ scale: 0.8 }}
                animate={
                  isFilled ? { scale: [1, 1.25, 1] } : { scale: 1 }
                }
                transition={{
                  duration: 0.28,
                  delay: isFilled ? starValue * 0.03 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
                aria-label={`${starValue} sur 5 étoiles`}
                className={cn(
                  'relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors duration-150',
                  isFilled
                    ? 'border-[#D88B99] bg-[#FDF8F9]'
                    : 'border-[#F3E1E6] bg-white'
                )}
              >
                {isCurrentTarget && (
                  <motion.span
                    layoutId="active-star-halo"
                    transition={HIGH_SPRING}
                    className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[#D88B99] bg-[#F9EBEF]/60"
                  />
                )}
                <Star
                  className={cn(
                    'relative z-10 h-6 w-6 transition-colors duration-150',
                    isFilled
                      ? 'fill-[#D88B99] text-[#D88B99]'
                      : 'text-[#F3E1E6]'
                  )}
                  strokeWidth={1.5}
                />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* 2. Champ commentaire */}
      <motion.div variants={FORM_CASCADE_ITEM}>
        <label
          htmlFor="review-comment"
          className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A]"
        >
          2. Qu’as-tu pensé de ta prestation ? *
        </label>
        <textarea
          id="review-comment"
          required
          rows={4}
          placeholder="Raconte ton expérience (douceur de la pose, tenue, accueil...)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4 text-base text-[#1C191A] placeholder:text-[#786B6E]/60 focus:border-[#D88B99] focus:bg-white focus:outline-none"
        />
      </motion.div>

      {/* 3. Choix d'affichage du prénom avec layoutId (stiffness: 380, damping: 28) */}
      <motion.div variants={FORM_CASCADE_ITEM}>
        <span className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A]">
          3. Comment souhaites-tu afficher ton nom ?
        </span>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {(
            [
              {
                key: 'FIRST_NAME_INITIAL',
                label: 'Prénom + initiale',
                preview: invitation.clientInitialPreview,
              },
              {
                key: 'FIRST_NAME',
                label: 'Prénom uniquement',
                preview: invitation.clientFirstNamePreview,
              },
            ] as const
          ).map((option) => {
            const isSelected = displayFormat === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setDisplayFormat(option.key)}
                className={cn(
                  'relative flex min-h-14 flex-col items-center justify-center rounded-2xl border px-3 py-2 text-center transition-transform duration-150 ease-emil-out active:scale-[0.97]',
                  isSelected
                    ? 'border-[#D88B99] text-[#1C191A]'
                    : 'border-[#F3E1E6] bg-[#FDF8F9] text-[#786B6E]'
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="review-display-format"
                    className="pointer-events-none absolute inset-0 rounded-2xl border border-[#D88B99] bg-[#F9EBEF]"
                    transition={HIGH_SPRING}
                  />
                )}
                <span className="relative z-10 text-xs font-semibold text-[#1C191A]">
                  {option.preview}
                </span>
                <span className="relative z-10 text-[11px] text-[#786B6E]">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 4. Case d'accord obligatoire avant publication */}
      <motion.label
        variants={FORM_CASCADE_ITEM}
        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4 text-xs leading-relaxed text-[#1C191A]"
      >
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#C47482]"
        />
        <span>
          J’accepte que mon avis et ma note soient publiés sur le site{' '}
          <strong>TON ESPACE BEAUTÉ</strong> avec le format de prénom choisi
          ci-dessus.
        </span>
      </motion.label>

      <motion.div variants={FORM_CASCADE_ITEM}>
        <TactileButton
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          disabled={!consentGiven}
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
          <span>Envoyer mon avis</span>
        </TactileButton>
      </motion.div>
    </motion.form>
  );
}
