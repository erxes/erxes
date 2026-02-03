import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { ExportHistories } from '~/modules/import-export/export/components/ExportHistories';

export const ExportIndexPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/import-export/export">Exports</Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <ExportHistories entityTypes={[
        "core:contact.customer",
        "core:contact.lead",
        "core:contact.company",
        "core:user.user",
        "core:product.product",
      ]} />
    </PageContainer>
  );
};
