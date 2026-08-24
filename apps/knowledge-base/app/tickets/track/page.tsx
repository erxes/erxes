import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/Hero';
import { TrackTicketForm } from '@/modules/tickets/components/TrackTicketForm';
import { Breadcrumbs } from '@/modules/ui/Breadcrumbs';

export const metadata = { title: 'Хүсэлт хянах' };

export default async function TrackTicketPage() {
  const { headline } = await getPortalIdentity();

  return (
    <>
      <Hero headline={headline} />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[
            { label: 'Мэдлэгийн сан', href: '/' },
            { label: 'Дэмжлэг', href: '/tickets' },
            { label: 'Хүсэлт хянах' },
          ]}
        />

        <h1 className="mt-6 text-[28px] font-semibold text-ink">
          Хүсэлт хянах
        </h1>
        <p className="mt-2 text-sm text-muted">
          Хүсэлт үүсгэхэд олгогдсон дугаарыг ашиглан төлөвөө шалгана уу.
        </p>

        <div className="mt-7">
          <TrackTicketForm />
        </div>
      </div>
    </>
  );
}
