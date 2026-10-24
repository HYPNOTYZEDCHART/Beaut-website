'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Info,
  ArrowRight,
} from 'lucide-react';
import { ServiceCatalogItemDTO } from '@/actions/availability.actions';
import { formatXof } from '@/lib/whatsapp';
import { PowderyBadge } from '@/components/ui/PowderyBadge';
import { TactileButton } from '@/components/ui/TactileButton';
import { ServiceConditionsDrawer } from '@/components/ui/ServiceConditionsDrawer';

interface PrestationsClientListProps {
  services: ServiceCatalogItemDTO[];
  compact?: boolean;
}

export function PrestationsClientList({
  services,
  compact = false,
}: PrestationsClientListProps) {
  const router = useRouter();
  const [selectedForDrawer, setSelectedForDrawer] =
    useState<ServiceCatalogItemDTO | null>(null);

  useEffect(() => {
    router.prefetch('/reserver');
  }, [router]);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 overflow-x-clip">
        {services.map((service, index) => {
          const enterFromLeft = index % 2 === 0;
          return (
            <motion.article
              key={service.id}
              initial={{
                opacity: 0,
                x: enterFromLeft ? -38 : 38,
                y: 16,
                scale: 0.96,
                filter: 'blur(4px)',
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
              }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 26,
                mass: 0.8,
              }}
              className="group hover-lift flex flex-col justify-between rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery transition-transform duration-200 ease-emil-out"
            >
            <div>
              {/* Visuel photo de la pose dans son écrin rose poudré */}
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9]">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-500 ease-emil-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-3 top-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-[#F3E1E6] bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#B36270] backdrop-blur-sm">
                      {service.category === 'REFILL'
                        ? 'Entretien & Suivi'
                        : 'Pose Complète'}
                    </span>
                    {service.isPromoActive && (
                      <span className="rounded-full border border-[#E57B8F]/30 bg-[#E57B8F] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
                        Promo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nom de la pose & Tarif en FCFA */}
              <div className="mt-2 flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-2xl font-semibold text-[#1C191A]">
                  {service.name}
                </h3>
                <div className="text-right tabular-nums">
                  {service.isPromoActive &&
                  service.regularPriceXof &&
                  service.regularPriceXof > service.priceXof ? (
                    <div>
                      <span className="line-through text-xs font-normal text-[#A89A9D] mr-1.5">
                        {formatXof(service.regularPriceXof)}
                      </span>
                      <span className="text-lg font-bold text-[#C47482]">
                        {formatXof(service.priceXof)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-semibold text-[#1C191A]">
                      {formatXof(service.priceXof)}
                    </p>
                  )}
                  <p className="text-[11px] text-[#786B6E]">
                    Acompte : {formatXof(service.depositXof)}
                  </p>
                </div>
              </div>

              {/* Description courte */}
              <p className="mt-3 text-sm leading-relaxed text-[#786B6E]">
                {service.shortDescription}
              </p>

              {/* Badges roses & sauge obligatoires */}
              <div className="mt-4 flex flex-wrap gap-2">
                {service.naturalLashesOnly ? (
                  <PowderyBadge variant="rose">
                    <Sparkles
                      className="h-3.5 w-3.5 text-[#D88B99]"
                      strokeWidth={1.5}
                    />
                    Sur cils naturels uniquement
                  </PowderyBadge>
                ) : (
                  <PowderyBadge variant="rose">
                    Pose réalisée au studio uniquement
                  </PowderyBadge>
                )}

                {service.refillAccepted && (
                  <PowderyBadge variant="sage">
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Remplissage accepté
                  </PowderyBadge>
                )}
              </div>
            </div>

            {/* Actions tactiles (min-h-12, active:scale-[0.98]) */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <TactileButton
                variant="secondary"
                className="sm:flex-1"
                onClick={() => setSelectedForDrawer(service)}
              >
                <Info className="h-4 w-4 text-[#D88B99]" strokeWidth={1.5} />
                <span>Détails & conditions</span>
              </TactileButton>

              <TactileButton
                variant="primary"
                className="sm:flex-1"
                onClick={() =>
                  router.push(`/reserver?service=${encodeURIComponent(service.slug)}`)
                }
              >
                <span>Choisir cette pose</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </TactileButton>
            </div>
            </motion.article>
          );
        })}
      </div>

      <ServiceConditionsDrawer
        service={selectedForDrawer}
        open={selectedForDrawer !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedForDrawer(null);
        }}
        onSelectService={(srv) =>
          router.push(`/reserver?service=${encodeURIComponent(srv.slug)}`)
        }
      />
    </>
  );
}

