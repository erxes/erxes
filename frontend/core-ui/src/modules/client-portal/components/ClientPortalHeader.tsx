import { Breadcrumb, Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { Can, PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconPlus, IconTerminal2 } from '@tabler/icons-react';
import { CreateClientPortalSheet } from '@/client-portal/components/ClientPortalAddSheet';
import { useAtom } from 'jotai';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { addingClientPortalAtom } from '../state';

export const ClientPortalHeader = () => {
  const [isAddingClientPortal, setIsAddingClientPortal] = useAtom(
    addingClientPortalAtom,
  );

  useScopedHotkeys(
    'c',
    () => {
      setIsAddingClientPortal(true);
    },
    SettingsHotKeyScope.ClientPortalsPage,
  );

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/client-portals">
                  <IconTerminal2 />
                  Client portal
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      <PageHeader.End>
        {/* <CreateClientPortalSheet /> */}
        <Can action="appsManage">
          <Button
            disabled={isAddingClientPortal}
            onClick={() => setIsAddingClientPortal(true)}
          >
            <IconPlus />
            Create Client Portal
            <Kbd>C</Kbd>
          </Button>
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
