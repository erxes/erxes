import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { ImportHistories } from '~/modules/import-export/import/components/ImportHistories';

export const ImportIndexPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/import-export/import">Imports</Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <ImportHistories entityTypes={[
        "core:contact.customer",
        "core:contact.lead",
        "core:contact.company",
        "core:user.user",
        "core:product.product",]} />
    </PageContainer>
  );
};
