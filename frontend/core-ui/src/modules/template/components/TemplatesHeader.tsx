import { IconPackage } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageHeader } from 'ui-modules';

export const TemplatesHeader = ({ current }: { current?: string }) => {
  const { t } = useTranslation('templates');

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/templates">
                  <IconPackage />
                  {t('templates')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            {current && (
              <>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Page>{current}</Breadcrumb.Page>
                </Breadcrumb.Item>
              </>
            )}
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
      </PageHeader.Start>
    </PageHeader>
  );
};
