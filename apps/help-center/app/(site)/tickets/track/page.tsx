import { getT } from '@/modules/i18n/server';
import { knowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import { getPortalSettings } from '@/modules/layout/api';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { TrackTicketForm } from '@/modules/tickets/components/TrackTicketForm';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';
import { ticketsOffReason } from '@/modules/tickets/constants/guard';

export const generateMetadata = async () => ({
  title: (await getT())('tickets.track'),
});

export default async function TrackTicketPage() {
  const [settings, t] = await Promise.all([getPortalSettings(), getT()]);

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: t('tickets.crumb'), href: '/tickets' },
        { label: t('tickets.track') },
      ]}
      title={t('tickets.track')}
      description={t('tickets.trackText')}
    >
      {settings.ticketsEnabled ? (
        <TrackTicketForm />
      ) : (
        <FeatureOff
          title={t('tickets.offTitle')}
          description={ticketsOffReason(
            knowledgeBaseName(settings.knowledgeBaseLabel, t),
            t,
          )}
        />
      )}
    </PortalShell>
  );
}
