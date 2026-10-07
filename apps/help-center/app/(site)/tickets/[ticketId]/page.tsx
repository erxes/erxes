import { getT } from '@/modules/i18n/server';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { TicketDetail } from '@/modules/tickets/components/TicketDetail';

type Props = { params: Promise<{ ticketId: string }> };

export const generateMetadata = async () => ({
  title: (await getT())('tickets.ticket'),
});

export default async function TicketPage({ params }: Props) {
  const [{ ticketId }, t] = await Promise.all([params, getT()]);

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: t('tickets.crumb'), href: '/tickets' },
        { label: t('tickets.ticket') },
      ]}
      title={t('tickets.ticket')}
      description={t('tickets.detailText')}
    >
      <TicketDetail ticketId={ticketId} />
    </PortalShell>
  );
}
