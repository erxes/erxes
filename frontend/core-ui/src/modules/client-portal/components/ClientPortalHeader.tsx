import { Breadcrumb, Button } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconTerminal2 } from '@tabler/icons-react';
import { CreateClientPortalSheet } from '@/client-portal/components/ClientPortalAddSheet';
import { useTranslation } from 'react-i18next';

export const ClientPortalHeader = () => {
  const { t } = useTranslation('client-portal');
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/client-portals">
                  <IconTerminal2 />
                  {t('client-portal', 'Client portal')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      <PageHeader.End>
        <CreateClientPortalSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
