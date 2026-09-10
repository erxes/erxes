import { RequireSession } from '@/modules/auth/components/RequireSession';
import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { TicketForm } from '@/modules/tickets/components/TicketForm';
import {
  NEW_TICKET_REASON,
  TICKETS_OFF_REASON,
  TICKETS_OFF_TITLE,
} from '@/modules/tickets/constants/guard';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';

export const metadata = { title: 'Submit a ticket' };

export default async function NewTicketPage() {
  const [{ headline }, settings] = await Promise.all([
    getPortalIdentity(),
    getPortalSettings(),
  ]);

  return (
    <>
      <Hero headline={headline} />

      <Container column="text" className="py-10 lg:py-14">
        <Breadcrumbs
          items={[
            { label: 'Knowledge base', href: '/' },
            { label: 'Support', href: '/tickets' },
            { label: 'Submit a ticket' },
          ]}
        />

        <h1 className="mt-6 text-[30px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">
          Submit a ticket
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Once you submit the form you get a ticket number, and you can track
          its progress here.
        </p>

        <div className="mt-7">
          {settings.ticketsEnabled ? (
            <RequireSession reason={NEW_TICKET_REASON}>
              <TicketForm target={settings.ticketTarget} />
            </RequireSession>
          ) : (
            <FeatureOff
              title={TICKETS_OFF_TITLE}
              description={TICKETS_OFF_REASON}
            />
          )}
        </div>
      </Container>
    </>
  );
}
