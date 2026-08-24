import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/Hero';
import { TicketForm } from '@/modules/tickets/components/TicketForm';
import { Breadcrumbs } from '@/modules/ui/Breadcrumbs';

export const metadata = { title: 'Хүсэлт илгээх' };

export default async function NewTicketPage() {
  const { headline } = await getPortalIdentity();

  return (
    <>
      <Hero headline={headline} />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[
            { label: 'Мэдлэгийн сан', href: '/' },
            { label: 'Дэмжлэг', href: '/tickets' },
            { label: 'Хүсэлт илгээх' },
          ]}
        />

        <h1 className="mt-6 text-[28px] font-semibold text-ink">
          Хүсэлт илгээх
        </h1>
        <p className="mt-2 text-sm text-muted">
          Маягтыг бөглөсний дараа хүсэлтийн дугаар үүсэх бөгөөд явцыг нь эндээс
          хянана.
        </p>

        <div className="mt-7">
          <TicketForm />
        </div>
      </div>
    </>
  );
}
