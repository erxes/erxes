import { Breadcrumb, Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { Can, PageHeader, usePermissionCheck } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconPlus, IconTerminal2 } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { addingClientPortalAtom } from '@/client-portal/state';

export const ClientPortalHeader = () => {
  const [isAddingClientPortal, setIsAddingClientPortal] = useAtom(
    addingClientPortalAtom,
  );
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canCreateClientPortal = isLoaded && hasActionPermission('appsManage');

  useScopedHotkeys(
    'c',
    () => {
      if (canCreateClientPortal) setIsAddingClientPortal(true);
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
