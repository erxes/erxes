import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { TicketDetail } from '@/modules/tickets/components/TicketDetail';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';

type Props = { params: Promise<{ ticketId: string }> };

export const metadata = { title: 'Хүсэлт' };

export default async function TicketPage({ params }: Props) {
  const [{ headline }, { ticketId }] = await Promise.all([
    getPortalIdentity(),
    params,
  ]);

  return (
    <>
      <Hero headline={headline} />

      <Container className="py-10 lg:py-14">
        <Breadcrumbs
          items={[
            { label: 'Мэдлэгийн сан', href: '/' },
            { label: 'Дэмжлэг', href: '/tickets' },
            { label: 'Хүсэлт' },
          ]}
        />

        <div className="mt-6">
          <TicketDetail ticketId={ticketId} />
        </div>
      </Container>
    </>
  );
}
