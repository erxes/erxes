import { Button, PageContainer, Kbd } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PagesRecordTable } from './components/PagesRecordTable';
import { IPage } from './types/pageTypes';
import { PagesHeader } from './components/PagesHeader';
import { CmsSidebar } from '../shared/CmsSidebar';
import { PagesFilter } from './components/PagesFilter';
import { CMS_PAGE_CONTENT_TYPE } from '@/cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from '@/cms/shared/side-panel/useContentPanel';

export function Page() {
  const { t } = useTranslation('content');
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const { openDetail } = useContentPanel(CMS_PAGE_CONTENT_TYPE);

  const headerActions = (
    <div>
      <Button
        onClick={() => navigate(`/content/cms/${websiteId}/pages/detail`)}
      >
        <IconPlus />
        {t('add-page')}
        <Kbd>C</Kbd>
      </Button>
    </div>
  );

  const handleEditPage = (page: IPage) => {
    openDetail(page._id);
  };

  return (
    <PageContainer className="flex-row">
      <CmsSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <PagesHeader>{headerActions}</PagesHeader>
        <div className="flex flex-col w-full overflow-hidden flex-auto">
          <div className="px-4 pt-2">
            <PagesFilter />
          </div>
          <PagesRecordTable
            clientPortalId={websiteId || ''}
            onEditPage={handleEditPage}
            onAdd={() => navigate(`/content/cms/${websiteId}/pages/detail`)}
          />
        </div>
      </div>
    </PageContainer>
  );
}
