import { SessionLink } from '@/modules/auth/components/SessionLink';
import {
  NEW_TICKET_REASON,
  NEW_TICKET_ROUTE,
} from '@/modules/tickets/constants/guard';
import { buttonClass, ButtonLink } from '@/modules/ui/components/Button';
import { Icon } from '@/modules/ui/components/Icon';
import { Reveal } from '@/modules/ui/components/Reveal';

export const SupportCta = ({
  ticketsEnabled,
  formsEnabled,
}: {
  ticketsEnabled: boolean;
  formsEnabled: boolean;
}) => {
  if (!ticketsEnabled && !formsEnabled) {
    return null;
  }

  return (
    <Reveal as="section">
      <div className="relative overflow-hidden rounded-3xl bg-shell px-7 py-10 text-white sm:px-12 sm:py-14">
        <div
          aria-hidden="true"
          className="animate-aurora pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/40 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="animate-aurora-slow pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-brand/20 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="hero-grid pointer-events-none absolute inset-0"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent"
        />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pl-2.5 pr-3.5 text-[12px] font-medium text-white/75">
              <Icon name="smile" size={14} />
              Still stuck?
            </span>

            <h2 className="mt-4 text-balance text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:text-[32px]">
              Cannot find the answer you need?
            </h2>

            <p className="mt-3 text-[15px] leading-relaxed text-white/60">
              {ticketsEnabled
                ? 'Send the details to the support team and follow every reply from your ticket page.'
                : 'Fill in a form and the support team will pick it up from there.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {ticketsEnabled ? (
              <>
                <SessionLink
                  href={NEW_TICKET_ROUTE}
                  reason={NEW_TICKET_REASON}
                  className={buttonClass({
                    variant: 'onHero',
                    size: 'lg',
                    className: 'group',
                  })}
                >
                  <Icon name="send" size={16} />
                  Submit a ticket
                  <Icon
                    name="chevronRight"
                    size={15}
                    className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                  />
                </SessionLink>

                <ButtonLink
                  href="/tickets/track"
                  variant="onHeroSoft"
                  size="lg"
                >
                  <Icon name="binoculars" size={16} />
                  Track a ticket
                </ButtonLink>
              </>
            ) : (
              <ButtonLink href="/forms" variant="onHero" size="lg">
                <Icon name="clipboard" size={16} />
                Fill in a form
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
};
