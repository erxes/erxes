import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/Hero';
import { TicketDetail } from '@/modules/tickets/components/TicketDetail';
import { Breadcrumbs } from '@/modules/ui/Breadcrumbs';

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

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
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
      </div>
    </>
  );
}
