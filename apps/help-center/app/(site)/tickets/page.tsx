import Link from 'next/link';
import { SessionLink } from '@/modules/auth/components/SessionLink';
import { getPortalSettings } from '@/modules/layout/api';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { MyTickets } from '@/modules/tickets/components/MyTickets';
import {
  NEW_TICKET_REASON,
  NEW_TICKET_ROUTE,
  TICKETS_OFF_REASON,
  TICKETS_OFF_TITLE,
} from '@/modules/tickets/constants/guard';
import { buttonClass } from '@/modules/ui/components/Button';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';
import { Icon } from '@/modules/ui/components/Icon';

export const metadata = { title: 'Support portal' };

export default async function TicketsPage() {
  const settings = await getPortalSettings();

  return (
    <PortalShell
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Support' }]}
      title="Support portal"
      description="Raise a ticket, track an existing one and follow the replies."
    >
      {!settings.ticketsEnabled ? (
        <FeatureOff
          title={TICKETS_OFF_TITLE}
          description={TICKETS_OFF_REASON}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-3">
            <SessionLink
              href={NEW_TICKET_ROUTE}
              reason={NEW_TICKET_REASON}
              className={buttonClass({ size: 'sm' })}
            >
              <Icon name="plus" size={16} />
              New ticket
            </SessionLink>

            <Link
              href="/tickets/track"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft outline-none transition-colors duration-150 hover:bg-subtle hover:text-ink focus-visible:bg-subtle"
            >
              <Icon name="binoculars" size={16} />
              Track by number
            </Link>

            <span className="ml-auto hidden text-[13px] text-muted-foreground sm:block">
              Replies arrive by email and show up here.
            </span>
          </div>

          <section aria-labelledby="my-tickets" className="mt-8">
            <h2
              id="my-tickets"
              className="text-[17px] font-semibold tracking-[-0.01em] text-ink"
            >
              My tickets
            </h2>

            <div className="mt-4">
              <MyTickets />
            </div>
          </section>
        </>
      )}
    </PortalShell>
  );
}
