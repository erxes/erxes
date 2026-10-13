import Link from 'next/link';
import { getTopicArticleList } from '@/modules/knowledge-base/api';
import { CategoryCard } from '@/modules/knowledge-base/components/CategoryCard';
import {
  browseCategories,
  browseGroups,
  sectionArticleCount,
} from '@/modules/knowledge-base/utils/selectors';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { SearchBar } from '@/modules/layout/components/SearchBar';
import { CountBadge } from '@/modules/ui/components/PageHeader';
import { ButtonLink } from '@/modules/ui/components/Button';
import {
  kbOffReason,
  kbOffTitle,
} from '@/modules/knowledge-base/constants/guard';
import { knowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import { getT } from '@/modules/i18n/server';
import { getPortalSettings } from '@/modules/layout/api';
import { FeatureOff } from '@/modules/ui/components/FeatureOff';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

export const generateMetadata = async () => {
  const [settings, t] = await Promise.all([getPortalSettings(), getT()]);

  return { title: knowledgeBaseName(settings.knowledgeBaseLabel, t).title };
};

export default async function KnowledgeBasePage() {
  const [settings, topic, t] = await Promise.all([
    getPortalSettings(),
    getTopicArticleList(),
    getT(),
  ]);

  const knowledgeBase = knowledgeBaseName(settings.knowledgeBaseLabel, t);

  const browse = topic.state === 'ready' ? browseCategories(topic.data) : [];
  const groups = topic.state === 'ready' ? browseGroups(topic.data) : [];

  const articleCount = browse.reduce(
    (sum, entry) => sum + entry.category.articleCount,
    0,
  );

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: knowledgeBase.title },
      ]}
      title={knowledgeBase.title}
      description={t('kb.description')}
      meta={
        browse.length ? (
          <span className="flex items-center gap-3 text-white/70">
            <CountBadge
              count={browse.length}
              label={t('kb.categoriesLabel', { count: browse.length })}
            />
            <span aria-hidden="true" className="text-white/20">
              •
            </span>
            <CountBadge
              count={articleCount}
              label={t('kb.articlesLabel', { count: articleCount })}
            />
          </span>
        ) : null
      }
      heroExtra={
        browse.length ? <SearchBar placeholder={t('kb.searchEvery')} /> : null
      }
    >
      {topic.state === 'unconfigured' ? (
        <SetupNotice missing={topic.missing} />
      ) : topic.state === 'unpublished' ? (
        <Unpublished domain={topic.domain} />
      ) : topic.state === 'error' ? (
        <LoadError message={topic.message} />
      ) : !topic.data.knowledgeBaseEnabled ? (
        <FeatureOff
          title={kbOffTitle(knowledgeBase, t)}
          description={kbOffReason(knowledgeBase, t)}
        />
      ) : browse.length ? (
        <div className="space-y-10">
          {groups.map(({ section, categories }) => (
            <section
              key={section?._id ?? 'ungrouped'}
              id={section ? `section-${section._id}` : undefined}
              aria-label={section?.title}
              className="scroll-mt-20"
            >
              {section ? (
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="text-[15px] font-semibold text-ink">
                    <Link
                      href={`/knowledge-base/category/${section._id}`}
                      className="transition-colors duration-200 hover:text-brand"
                    >
                      {section.title}
                    </Link>
                  </h2>
                  <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
                    {t('kb.articles', { count: sectionArticleCount(section) })}
                  </span>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => (
                  <CategoryCard
                    key={category._id}
                    category={category}
                    index={index}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="book"
          title={t('kb.empty', { name: knowledgeBase.title })}
          description={t('kb.emptyText')}
          action={
            <ButtonLink href="/tickets/new" size="sm">
              {t('tickets.create')}
            </ButtonLink>
          }
        />
      )}
    </PortalShell>
  );
}
