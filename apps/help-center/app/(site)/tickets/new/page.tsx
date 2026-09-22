import { RequireSession } from '@/modules/auth/components/RequireSession';
import { getTopicArticleList } from '@/modules/knowledge-base/api';
import {
  articleEntries,
  sortByReadership,
} from '@/modules/knowledge-base/utils/selectors';
import { getPortalSettings } from '@/modules/layout/api';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { TicketForm } from '@/modules/tickets/components/TicketForm';
import {
  TicketHelpAside,
  type TicketSuggestion,
} from '@/modules/tickets/components/TicketHelpAside';
import {
  NEW_TICKET_REASON,
  TICKETS_OFF_REASON,
  TICKETS_OFF_TITLE,
} from '@/modules/tickets/constants/guard';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';

const SUGGESTION_COUNT = 4;

export const metadata = { title: 'Submit a ticket' };

export default async function NewTicketPage() {
  const [settings, topic] = await Promise.all([
    getPortalSettings(),
    getTopicArticleList(),
  ]);

  const suggestions: TicketSuggestion[] =
    topic.state === 'ready' && topic.data.knowledgeBaseEnabled
      ? sortByReadership(articleEntries(topic.data))
          .slice(0, SUGGESTION_COUNT)
          .map(({ article }) => ({ _id: article._id, title: article.title }))
      : [];

  if (!settings.ticketsEnabled) {
    return (
      <PortalShell
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Support', href: '/tickets' },
          { label: 'Submit a ticket' },
        ]}
        title="Submit a ticket"
      >
        <FeatureOff
          title={TICKETS_OFF_TITLE}
          description={TICKETS_OFF_REASON}
        />
      </PortalShell>
    );
  }

  return (
    <PortalShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Support', href: '/tickets' },
        { label: 'Submit a ticket' },
      ]}
      title="Submit a ticket"
      description="Once you submit the form you get a ticket number, and you can track its progress here."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <RequireSession reason={NEW_TICKET_REASON}>
          <TicketForm target={settings.ticketTarget} />
        </RequireSession>

        <TicketHelpAside suggestions={suggestions} />
      </div>
    </PortalShell>
  );
}
