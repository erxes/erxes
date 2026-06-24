import { IconSandbox } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PmsCreateSheet } from '@/pms/components/CreatePmsSheet';
import { PmsList } from '@/pms/components/PmsList';

export const IndexPage = () => {
  const { t } = useTranslation('tourism');
  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/pms">
                    <IconSandbox />
                    {t('pms-index-breadcrumb')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          {/* <Button variant="outline" asChild>
            <Link to="/settings/pms">
              <IconSettings />
              Go to settings
            </Link>
          </Button> */}
          <PmsCreateSheet />
        </PageHeader.End>
      </PageHeader>

      <div>
        <PmsList />
      </div>
    </div>
  );
};
