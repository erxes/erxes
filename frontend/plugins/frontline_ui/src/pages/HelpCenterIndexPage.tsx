import { IconLifebuoy, IconPlus } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Kbd,
  PageContainer,
  PageSubHeader,
  Separator,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { HelpCenterFilter } from '@/helpcenter/components/HelpCenterFilter';
import { HelpCenterRecordTable } from '@/helpcenter/components/HelpCenterRecordTable';
import {
  useAllHelpCenters,
  useHelpCenters,
} from '@/helpcenter/hooks/useHelpCenters';
import { TopicDrawer } from '@/knowledgebase/components/TopicDrawer';
import { toTopicDrawerRecord } from '@/helpcenter/utils/toTopicDrawerRecord';

const HelpCenterIndexPage = () => {
  const { t } = useTranslation('frontline');
  const { refetch } = useHelpCenters();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editId, setEditId] = useQueryState<string>('editId');
  const { helpCenters, refetch: refetchAll } = useAllHelpCenters();

  const editing = (helpCenters ?? []).find(
    (helpCenter) => helpCenter._id === editId,
  );

  const handleCloseDrawer = () => {
    setIsCreateOpen(false);
    setEditId(null);
  };

  const handleSaved = () => {
    refetch();
    refetchAll();
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/helpcenter">
                    <IconLifebuoy />
                    {t('help-center', 'Help Center')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={createFavoriteBreadcrumb(
              t('help-center', 'Help Center'),
            )}
            icon="IconLifebuoy"
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={() => setIsCreateOpen(true)} className="h-7 py-1">
            <IconPlus />
            {t('kb-create-topic')}
            <Kbd>C</Kbd>
          </Button>
        </PageHeader.End>
      </PageHeader>

      <PageSubHeader>
        <HelpCenterFilter />
      </PageSubHeader>

      <HelpCenterRecordTable onCreate={() => setIsCreateOpen(true)} />

      <TopicDrawer
        key={editing?._id ?? 'create'}
        topic={toTopicDrawerRecord(editing)}
        isOpen={isCreateOpen || !!editing}
        onClose={handleCloseDrawer}
        onSaved={handleSaved}
      />
    </PageContainer>
  );
};

export default HelpCenterIndexPage;
