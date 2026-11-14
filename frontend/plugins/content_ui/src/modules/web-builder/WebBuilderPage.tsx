import { IconWorldPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CmsLayout } from '../cms/shared/CmsLayout';
import { WebList } from './components/WebList';
import { CONTENT_WEB_CONTENT_TYPE } from '@/cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from '@/cms/shared/side-panel/useContentPanel';

const BREADCRUMB_ITEMS = [
  {
    label: 'Web Builder',
    href: '/content/web-builder',
    icon: <IconWorldPlus />,
  },
];

const AddWebButton = () => {
  const { t } = useTranslation('content');
  const { openDraft } = useContentPanel(CONTENT_WEB_CONTENT_TYPE);
  return (
    <Button onClick={() => openDraft()}>
      <IconWorldPlus className="mr-2 h-4 w-4" />
      {t('new-web-project')}
    </Button>
  );
};

export function WebBuilderPage() {
  return (
    <CmsLayout
      showSidebar={false}
      breadcrumbItems={BREADCRUMB_ITEMS}
      headerActions={<AddWebButton />}
    >
      <WebList />
    </CmsLayout>
  );
}
