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
      title="Ticket"
      description="Follow the replies and add anything the support team still needs."
    >
      <TicketDetail ticketId={ticketId} />
    </PortalShell>
  );
}
