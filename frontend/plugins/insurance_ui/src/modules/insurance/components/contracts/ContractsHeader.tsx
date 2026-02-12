import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconFileText } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';

export const ContractsHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/insurance/products">
                  <IconFileText />
                  Insurance
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Button variant="ghost">
                <IconFileText />
                Contracts
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
    </PageHeader>
  );
};
