import { Button, PageContainer, Kbd } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PagesRecordTable } from './components/PagesRecordTable';
import { IPage } from './types/pageTypes';
import { PagesHeader } from './components/PagesHeader';
import { CmsSidebar } from '../shared/CmsSidebar';
import { PagesFilter } from './components/PagesFilter';

export function Page() {
  const { t } = useTranslation('content');
  const { websiteId } = useParams();
  const navigate = useNavigate();

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
    navigate(`/content/cms/${page.clientPortalId}/pages/detail/${page._id}`);
  };

  return (
    <PageContainer>
      <PagesHeader>{headerActions}</PagesHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
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
