import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconSandbox, IconAlertTriangle, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';

interface RisksHeaderProps {
  onCreateClick: () => void;
}

export const RisksHeader = ({ onCreateClick }: RisksHeaderProps) => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/insurance/products">
                  <IconSandbox />
                  Insurance
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Button variant="ghost">
                <IconAlertTriangle />
                Risk Types
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
      <PageHeader.End>
        <Button onClick={onCreateClick}>
          <IconPlus size={16} />
          New Risk Type
        </Button>
      </PageHeader.End>
    </PageHeader>
  );
};
