import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { TicketForm } from '@/modules/tickets/components/TicketForm';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';

export const metadata = { title: 'Хүсэлт илгээх' };

export default async function NewTicketPage() {
  const { headline } = await getPortalIdentity();

  return (
    <>
      <Hero headline={headline} />

      <Container width="text" className="py-10 lg:py-14">
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
        <p className="mt-2 text-sm text-muted-foreground">
          Маягтыг бөглөсний дараа хүсэлтийн дугаар үүсэх бөгөөд явцыг нь эндээс
          хянана.
        </p>

        <div className="mt-7">
          <TicketForm />
        </div>
      </Container>
    </>
  );
}
