import { RequireSession } from '@/modules/auth/components/RequireSession';
import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { TicketForm } from '@/modules/tickets/components/TicketForm';
import {
  NEW_TICKET_REASON,
  TICKETS_OFF_REASON,
  TICKETS_OFF_TITLE,
} from '@/modules/tickets/constants/guard';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';

export const metadata = { title: 'Хүсэлт илгээх' };

export default async function NewTicketPage() {
  const [{ headline }, settings] = await Promise.all([
    getPortalIdentity(),
    getPortalSettings(),
  ]);

  return (
    <>
      <Hero headline={headline} />

      <Container column="text" className="py-10 lg:py-14">
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
          {settings.ticketsEnabled ? (
            <RequireSession reason={NEW_TICKET_REASON}>
              <TicketForm target={settings.ticketTarget} />
            </RequireSession>
          ) : (
            <FeatureOff
              title={TICKETS_OFF_TITLE}
              description={TICKETS_OFF_REASON}
            />
          )}
        </div>
      </Container>
    </>
  );
}
