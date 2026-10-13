import Link from 'next/link';
import { SessionLink } from '@/modules/auth/components/SessionLink';
import { getT } from '@/modules/i18n/server';
import { knowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import { getPortalSettings } from '@/modules/layout/api';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { MyTickets } from '@/modules/tickets/components/MyTickets';
import {
  NEW_TICKET_ROUTE,
  ticketsOffReason,
} from '@/modules/tickets/constants/guard';
import { buttonClass } from '@/modules/ui/components/Button';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';
import { Icon } from '@/modules/ui/components/Icon';

export const generateMetadata = async () => ({
  title: (await getT())('tickets.portalTitle'),
});

export default async function TicketsPage() {
  const [settings, t] = await Promise.all([getPortalSettings(), getT()]);

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: t('tickets.crumb') },
      ]}
      title={t('tickets.portalTitle')}
      description={t('tickets.portalText')}
    >
      {!settings.ticketsEnabled ? (
        <FeatureOff
          title={t('tickets.offTitle')}
          description={ticketsOffReason(
            knowledgeBaseName(settings.knowledgeBaseLabel, t),
            t,
          )}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-shell">
            <SessionLink
              href={NEW_TICKET_ROUTE}
              reason={t('tickets.signInReason')}
              className={buttonClass({ size: 'sm' })}
            >
              <Icon name="plus" size={16} />
              {t('tickets.newShort')}
            </SessionLink>

            <Link
              href="/tickets/track"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft outline-none transition-colors duration-300 ease-out-soft hover:bg-subtle hover:text-ink focus-visible:bg-subtle"
            >
              <Icon name="binoculars" size={16} />
              {t('tickets.trackByNumber')}
            </Link>

            <span className="ml-auto hidden text-[13px] text-muted-foreground sm:block">
              {t('tickets.repliesByEmail')}
            </span>
          </div>

          <section aria-labelledby="my-tickets" className="mt-8">
            <h2
              id="my-tickets"
              className="text-[17px] font-semibold tracking-[-0.01em] text-ink"
            >
              {t('tickets.mine')}
            </h2>

            <div className="mt-4">
              <MyTickets />
            </div>
          </section>
        </>
      )}
    </PortalShell>
  );
}
