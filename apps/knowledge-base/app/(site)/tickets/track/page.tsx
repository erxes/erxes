import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { TrackTicketForm } from '@/modules/tickets/components/TrackTicketForm';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';

export const metadata = { title: 'Хүсэлт хянах' };

export default async function TrackTicketPage() {
  const { headline } = await getPortalIdentity();

  return (
    <>
      <Hero headline={headline} />

      <Container column="text" className="py-10 lg:py-14">
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
        <p className="mt-2 text-sm text-muted-foreground">
          Хүсэлт үүсгэхэд олгогдсон дугаарыг ашиглан төлөвөө шалгана уу.
        </p>

        <div className="mt-7">
          <TrackTicketForm />
        </div>
      </Container>
    </>
  );
}
