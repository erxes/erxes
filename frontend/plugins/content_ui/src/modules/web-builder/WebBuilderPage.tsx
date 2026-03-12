import { IconWorldPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { CmsLayout } from '../cms/shared/CmsLayout';
import { WebList } from './components/WebList';
import { WebDrawer } from './components/WebDrawer';
import { webDrawerState } from './states/webBuilderState';

const BREADCRUMB_ITEMS = [
  {
    label: 'Web Builder',
    href: '/content/web-builder',
    icon: <IconWorldPlus />,
  },
];

const AddWebButton = () => {
  const setDrawer = useSetAtom(webDrawerState);
  return (
    <Button onClick={() => setDrawer({ open: true, editingWeb: null })}>
      <IconWorldPlus className="mr-2 h-4 w-4" />
      New Web Project
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
      <WebDrawer />
    </CmsLayout>
  );
}
