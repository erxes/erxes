import { IconBook } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer, Separator } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { KnowledgeBaseSidebar } from '@/knowledgebase/shared/components/KnowledgeBaseSidebar';
import { TKnowledgeBaseSection } from '@/knowledgebase/types';

const SECTION_LABELS: Record<TKnowledgeBaseSection, [string, string]> = {
  articles: ['articles', 'Articles'],
  categories: ['kb-categories', 'Categories'],
  kbsettings: ['settings', 'Settings'],
};

export const KnowledgeBaseLayout = ({
  topicId,
  topicTitle,
  section,
  actions,
  children,
}: {
  topicId?: string;
  topicTitle?: string;
  section?: TKnowledgeBaseSection;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  const { t } = useTranslation('frontline');

  const rootLabel = t('knowledge-base', 'Knowledge Base');
  const sectionLabel = section
    ? t(SECTION_LABELS[section][0], SECTION_LABELS[section][1])
    : undefined;
  const topicLabel = topicTitle || t('unnamed-topic', 'Unnamed topic');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to={KNOWLEDGE_BASE_PATH}>
                    <IconBook />
                    {rootLabel}
                  </Link>
                </Button>
              </Breadcrumb.Item>

              {topicId && (
                <>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Button variant="ghost" asChild>
                      <Link to={`${KNOWLEDGE_BASE_PATH}/${topicId}/articles`}>
                        {topicLabel}
                      </Link>
                    </Button>
                  </Breadcrumb.Item>
                </>
              )}

              {sectionLabel && (
                <>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Button variant="ghost">{sectionLabel}</Button>
                  </Breadcrumb.Item>
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>

          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={createFavoriteBreadcrumb(
              rootLabel,
              topicId && topicLabel,
              sectionLabel,
            )}
            icon="IconBook"
          />
        </PageHeader.Start>
        <PageHeader.End>{actions}</PageHeader.End>
      </PageHeader>

      {topicId && section ? (
        <div className="flex flex-auto overflow-hidden">
          <KnowledgeBaseSidebar topicId={topicId} section={section} />
          <div className="flex flex-col flex-auto overflow-hidden">
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </PageContainer>
  );
};
