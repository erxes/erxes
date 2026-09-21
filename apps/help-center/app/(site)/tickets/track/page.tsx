import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { TrackTicketForm } from '@/modules/tickets/components/TrackTicketForm';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';
import {
  TICKETS_OFF_REASON,
  TICKETS_OFF_TITLE,
} from '@/modules/tickets/constants/guard';

export const metadata = { title: 'Track a ticket' };

export default async function TrackTicketPage() {
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
            { label: 'Knowledge base', href: '/' },
            { label: 'Support', href: '/tickets' },
            { label: 'Track a ticket' },
          ]}
        />

        <h1 className="mt-6 text-[30px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">
          Track a ticket
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the number you were given when the ticket was created to check its
          status.
        </p>

        <div className="mt-7">
          {settings.ticketsEnabled ? (
            <TrackTicketForm />
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
