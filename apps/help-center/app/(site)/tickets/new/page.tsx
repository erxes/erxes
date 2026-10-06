import { RequireSession } from '@/modules/auth/components/RequireSession';
import { getTopicArticleList } from '@/modules/knowledge-base/api';
import {
  articleEntries,
  sortByReadership,
} from '@/modules/knowledge-base/utils/selectors';
import { getT } from '@/modules/i18n/server';
import { knowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import { getPortalSettings } from '@/modules/layout/api';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { TicketForm } from '@/modules/tickets/components/TicketForm';
import {
  TicketHelpAside,
  type TicketSuggestion,
} from '@/modules/tickets/components/TicketHelpAside';
import { ticketsOffReason } from '@/modules/tickets/constants/guard';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';

const SUGGESTION_COUNT = 4;

export const generateMetadata = async () => ({
  title: (await getT())('tickets.submit'),
});

export default async function NewTicketPage() {
  const [settings, topic, t] = await Promise.all([
    getPortalSettings(),
    getTopicArticleList(),
    getT(),
  ]);

  const crumbs = [
    { label: t('nav.home'), href: '/' },
    { label: t('tickets.crumb'), href: '/tickets' },
    { label: t('tickets.submit') },
  ];

  const suggestions: TicketSuggestion[] =
    topic.state === 'ready' && topic.data.knowledgeBaseEnabled
      ? sortByReadership(articleEntries(topic.data))
          .slice(0, SUGGESTION_COUNT)
          .map(({ article }) => ({ _id: article._id, title: article.title }))
      : [];

  if (!settings.ticketsEnabled) {
    return (
      <PortalShell breadcrumbs={crumbs} title={t('tickets.submit')}>
        <FeatureOff
          title={t('tickets.offTitle')}
          description={ticketsOffReason(
            knowledgeBaseName(settings.knowledgeBaseLabel, t),
            t,
          )}
        />
      </PortalShell>
    );
  }

  return (
    <PortalShell
      breadcrumbs={crumbs}
      title={t('tickets.submit')}
      description={t('tickets.newText')}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <RequireSession reason={t('tickets.signInReason')}>
          <TicketForm target={settings.ticketTarget} />
        </RequireSession>

        <TicketHelpAside suggestions={suggestions} />
      </div>
    </PortalShell>
  );
}
