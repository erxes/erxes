import { SessionLink } from '@/modules/auth/components/SessionLink';
import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { MyTickets } from '@/modules/tickets/components/MyTickets';
import {
  NEW_TICKET_REASON,
  NEW_TICKET_ROUTE,
  TICKETS_OFF_REASON,
  TICKETS_OFF_TITLE,
} from '@/modules/tickets/constants/guard';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { buttonClass } from '@/modules/ui/components/Button';
import { CardLink, cardLinkClass } from '@/modules/ui/components/Card';
import { Container } from '@/modules/ui/components/Container';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';
import { Icon } from '@/modules/ui/components/Icon';

export const metadata = { title: 'Support portal' };

export default async function TicketsPage() {
  const [{ headline }, settings] = await Promise.all([
    getPortalIdentity(),
    getPortalSettings(),
  ]);

  return (
    <>
      <Hero headline={headline} />

      <Container className="py-10 lg:py-14">
        <Breadcrumbs
          items={[{ label: 'Knowledge base', href: '/' }, { label: 'Support' }]}
        />

        <h1 className="mt-6 text-[30px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">
          Support portal
        </h1>

        {!settings.ticketsEnabled ? (
          <div className="mt-7">
            <FeatureOff
              title={TICKETS_OFF_TITLE}
              description={TICKETS_OFF_REASON}
            />
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <SessionLink
                href={NEW_TICKET_ROUTE}
                reason={NEW_TICKET_REASON}
                className={cardLinkClass('flex items-start gap-4 p-6')}
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon name="inbox" size={22} />
                </span>
                <span>
                  <span className="block text-base font-semibold text-ink">
                    Submit a ticket
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                    Fill in the form to raise a new ticket with the support
                    team.
                  </span>
                </span>
              </SessionLink>

              <CardLink
                href="/tickets/track"
                className="flex items-start gap-4 p-6"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon name="binoculars" size={22} />
                </span>
                <span>
                  <span className="block text-base font-semibold text-ink">
                    Track a ticket
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                    Use your ticket number to check its status and replies.
                  </span>
                </span>
              </CardLink>
            </div>

            <section aria-labelledby="my-tickets" className="mt-12">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="my-tickets" className="text-xl font-semibold text-ink">
                  My tickets
                </h2>
                <SessionLink
                  href={NEW_TICKET_ROUTE}
                  reason={NEW_TICKET_REASON}
                  className={buttonClass({ size: 'sm' })}
                >
                  <Icon name="plus" size={16} />
                  New ticket
                </SessionLink>
              </div>

              <div className="mt-5">
                <MyTickets />
              </div>
            </section>
          </>
        )}
      </Container>
    </>
  );
}
