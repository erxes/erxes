import { getPortalSettings } from '@/modules/layout/api';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { TrackTicketForm } from '@/modules/tickets/components/TrackTicketForm';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';
import {
  TICKETS_OFF_REASON,
  TICKETS_OFF_TITLE,
} from '@/modules/tickets/constants/guard';

export const metadata = { title: 'Track a ticket' };

export default async function TrackTicketPage() {
  const settings = await getPortalSettings();

  return (
    <PortalShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Support', href: '/tickets' },
        { label: 'Track a ticket' },
      ]}
      title="Track a ticket"
      description="Use the number you were given when the ticket was created to check its status."
    >
      {settings.ticketsEnabled ? (
        <TrackTicketForm />
      ) : (
        <FeatureOff
          title={TICKETS_OFF_TITLE}
          description={TICKETS_OFF_REASON}
        />
      )}
    </PortalShell>
  );
}
