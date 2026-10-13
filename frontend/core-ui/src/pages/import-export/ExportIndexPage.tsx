import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { ExportHistories } from '~/modules/import-export/export/components/ExportHistories';
import { useTranslation } from 'react-i18next';

export const ExportIndexPage = () => {
  const { t } = useTranslation('importExport');
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/import-export/export">{t('exports')}</Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <ExportHistories />
    </PageContainer>
  );
};
