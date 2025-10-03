import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { CreateBrand } from './CreateBrand';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconChessKnightFilled } from '@tabler/icons-react';

export function BrandsHeader() {
  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/brands">
                  <IconChessKnightFilled />
                  Brands
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <CreateBrand />
      </PageHeaderEnd>
    </PageHeader>
  );
}
