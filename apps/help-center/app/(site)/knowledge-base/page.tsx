import { getTopicArticleList } from '@/modules/knowledge-base/api';
import { CategoryCard } from '@/modules/knowledge-base/components/CategoryCard';
import {
  articleEntries,
  browseCategories,
  sortByReadership,
} from '@/modules/knowledge-base/utils/selectors';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { SearchBar } from '@/modules/layout/components/SearchBar';
import { CountBadge } from '@/modules/ui/components/PageHeader';
import { ButtonLink } from '@/modules/ui/components/Button';
import {
  KB_OFF_REASON,
  KB_OFF_TITLE,
} from '@/modules/knowledge-base/constants/guard';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

const SUGGESTION_COUNT = 4;

export const metadata = { title: 'Knowledge base' };

export default async function KnowledgeBasePage() {
  const topic = await getTopicArticleList();

  const browse = topic.state === 'ready' ? browseCategories(topic.data) : [];

  const searchSuggestions =
    topic.state === 'ready'
      ? sortByReadership(articleEntries(topic.data))
          .slice(0, SUGGESTION_COUNT)
          .map(({ article }) => article.title)
      : [];

  const articleCount = browse.reduce(
    (sum, entry) => sum + entry.category.articleCount,
    0,
  );

  return (
    <PortalShell
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Knowledge base' }]}
      title="Knowledge base"
      description="Guides, answers to common questions and policies, grouped by category."
      meta={
        browse.length ? (
          <span className="flex items-center gap-3 text-white/70">
            <CountBadge
              count={browse.length}
              label={browse.length === 1 ? 'category' : 'categories'}
            />
            <span aria-hidden="true" className="text-white/20">
              •
            </span>
            <CountBadge
              count={articleCount}
              label={articleCount === 1 ? 'article' : 'articles'}
            />
          </span>
        ) : null
      }
      heroExtra={
        browse.length ? (
          <SearchBar
            placeholder="Search every article"
            suggestions={searchSuggestions}
          />
        ) : null
      }
    >
      {topic.state === 'unconfigured' ? (
        <SetupNotice missing={topic.missing} />
      ) : topic.state === 'unpublished' ? (
        <Unpublished domain={topic.domain} />
      ) : topic.state === 'error' ? (
        <LoadError message={topic.message} />
      ) : !topic.data.knowledgeBaseEnabled ? (
        <FeatureOff title={KB_OFF_TITLE} description={KB_OFF_REASON} />
      ) : browse.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {browse.map(({ category, group }, index) => (
            <CategoryCard
              key={category._id}
              category={category}
              eyebrow={group ?? undefined}
              index={index}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="book"
          title="The knowledge base is empty"
          description="This topic has no published categories. Add one under Frontline → Knowledge Base."
          action={
            <ButtonLink href="/tickets/new" size="sm">
              Create a ticket
            </ButtonLink>
          }
        />
      )}
    </PortalShell>
  );
}
