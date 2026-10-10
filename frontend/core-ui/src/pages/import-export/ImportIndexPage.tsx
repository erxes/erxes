import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { ImportHistories } from '~/modules/import-export/import/components/ImportHistories';
import { useTranslation } from 'react-i18next';

export const ImportIndexPage = () => {
  const { t } = useTranslation('importExport');
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/import-export/import">{t('imports')}</Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <ImportHistories />
    </PageContainer>
  );
};
