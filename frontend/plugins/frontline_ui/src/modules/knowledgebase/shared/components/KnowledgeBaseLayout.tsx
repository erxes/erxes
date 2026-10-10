import { IconBook } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  ToggleGroup,
} from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { TKnowledgeBaseSection } from '@/knowledgebase/types';

const SECTIONS: { value: TKnowledgeBaseSection; key: string; label: string }[] =
  [
    { value: 'articles', key: 'articles', label: 'Articles' },
    { value: 'categories', key: 'kb-categories', label: 'Categories' },
    { value: 'kbsettings', key: 'settings', label: 'Settings' },
  ];

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
  const current = SECTIONS.find((item) => item.value === section);
  const sectionLabel = current ? t(current.key, current.label) : undefined;
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

              {topicId && section && (
                <>
                  <Breadcrumb.Separator />
                  <ToggleGroup type="single" value={section}>
                    {SECTIONS.map((item) => (
                      <ToggleGroup.Item
                        key={item.value}
                        value={item.value}
                        asChild
                      >
                        <Link
                          to={`${KNOWLEDGE_BASE_PATH}/${topicId}/${item.value}`}
                        >
                          {t(item.key, item.label)}
                        </Link>
                      </ToggleGroup.Item>
                    ))}
                  </ToggleGroup>
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

      {children}
    </PageContainer>
  );
};
