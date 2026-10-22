'use client';

import React from 'react';
import { Drawer } from 'vaul';
import { Sparkles, CheckCircle2, Info, X } from 'lucide-react';
import { ServiceCatalogItemDTO } from '@/actions/availability.actions';
import { formatXof } from '@/lib/whatsapp';
import { PowderyBadge } from '@/components/ui/PowderyBadge';
import { TactileButton } from '@/components/ui/TactileButton';

interface ServiceConditionsDrawerProps {
  service: ServiceCatalogItemDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectService?: (service: ServiceCatalogItemDTO) => void;
}

export function ServiceConditionsDrawer({
  service,
  open,
  onOpenChange,
  onSelectService,
}: ServiceConditionsDrawerProps) {
  if (!service) return null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-[#1C191A]/30 backdrop-blur-[2px] transition-opacity duration-200 ease-emil-out" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[88dvh] flex-col rounded-t-[28px] border-t border-[#F3E1E6] bg-white shadow-powderyLg focus:outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-[#F3E1E6]" />

          <div className="flex items-start justify-between border-b border-[#F3E1E6] px-6 py-4">
            <div>
              <Drawer.Title className="font-serif text-2xl font-semibold text-[#1C191A]">
                {service.name}
              </Drawer.Title>
              <Drawer.Description className="mt-0.5 flex items-center gap-3 text-sm text-[#786B6E] tabular-nums">
                <span className="font-semibold text-[#1C191A]">
                  {formatXof(service.priceXof)}
                </span>
              </Drawer.Description>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fermer les détails"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#F3E1E6] bg-[#FDF8F9] text-[#786B6E] transition-transform duration-150 ease-emil-out active:scale-[0.96]"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="sheet-scroll px-6 py-5 space-y-5">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] shadow-powdery">
              <img
                src={service.imageUrl}
                alt={service.name}
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C191A]/55 via-[#1C191A]/15 to-transparent p-3.5">
                <div className="flex flex-wrap gap-1.5">
                  {service.naturalLashesOnly && (
                    <PowderyBadge
                      variant="rose"
                      className="bg-white/95 backdrop-blur-sm"
                    >
                      <Sparkles
                        className="h-3.5 w-3.5 text-[#D88B99]"
                        strokeWidth={1.5}
                      />
                      Sur cils naturels uniquement
                    </PowderyBadge>
                  )}
                  {service.refillAccepted && (
                    <PowderyBadge
                      variant="sage"
                      className="bg-[#EBF5F0]/95 backdrop-blur-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Remplissage accepté
                    </PowderyBadge>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#786B6E]">
              {service.fullDescription ?? service.shortDescription}
            </p>

            {service.refillConditions && (
              <div className="rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B36270]">
                  <Info className="h-4 w-4 text-[#D88B99]" strokeWidth={1.5} />
                  Conditions de remplissage & pose
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#1C191A]">
                  {service.refillConditions}
                </p>
              </div>
            )}

            {service.prepInstructions && (
              <div className="rounded-2xl border border-[#F3E1E6] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#786B6E]">
                  Préparation avant de venir
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#1C191A]">
                  {service.prepInstructions}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] px-4 py-3 text-sm tabular-nums">
              <span className="text-[#786B6E]">Acompte de réservation</span>
              <span className="font-semibold text-[#1C191A]">
                {formatXof(service.depositXof)}
              </span>
            </div>
          </div>

          {onSelectService && (
            <div className="safe-bottom border-t border-[#F3E1E6] bg-white px-5 pt-4">
              <TactileButton
                fullWidth
                onClick={() => {
                  onSelectService(service);
                  onOpenChange(false);
                }}
              >
                Choisir cette pose ({formatXof(service.priceXof)})
              </TactileButton>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

