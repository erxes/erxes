import { IconPlug, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Can, PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { connectionSheetAtom } from '@/settings/connections/state';

export const ConnectionsHeader = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'connections' });
  const setSheet = useSetAtom(connectionSheetAtom);

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/connections">
                  <IconPlug />
                  {t('title', 'Connections')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <Can action="manageConnections">
          <Button onClick={() => setSheet({ mode: 'create' })}>
            <IconPlus />
            {t('add-connection', 'Add connection')}
          </Button>
        </Can>
      </PageHeaderEnd>
    </PageHeader>
  );
};
