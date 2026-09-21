import { PortalShell } from '@/modules/layout/components/PortalShell';
import { TicketDetail } from '@/modules/tickets/components/TicketDetail';

type Props = { params: Promise<{ ticketId: string }> };

export const metadata = { title: 'Ticket' };

export default async function TicketPage({ params }: Props) {
  const { ticketId } = await params;

  return (
    <PortalShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Support', href: '/tickets' },
        { label: 'Ticket' },
      ]}
    >
      <TicketDetail ticketId={ticketId} />
    </PortalShell>
  );
}
