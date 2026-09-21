import { RequireSession } from '@/modules/auth/components/RequireSession';
import { getPortalSettings } from '@/modules/layout/api';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { TicketForm } from '@/modules/tickets/components/TicketForm';
import {
  NEW_TICKET_REASON,
  TICKETS_OFF_REASON,
  TICKETS_OFF_TITLE,
} from '@/modules/tickets/constants/guard';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';

export const metadata = { title: 'Submit a ticket' };

export default async function NewTicketPage() {
  const settings = await getPortalSettings();

  return (
    <PortalShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Support', href: '/tickets' },
        { label: 'Submit a ticket' },
      ]}
      title="Submit a ticket"
      description="Once you submit the form you get a ticket number, and you can track its progress here."
    >
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
    </PortalShell>
  );
}
