import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconSandbox, IconUsers, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';

interface VendorUsersHeaderProps {
  onAddUser: () => void;
  canAddUser: boolean;
}

export const VendorUsersHeader = ({
  onAddUser,
  canAddUser,
}: VendorUsersHeaderProps) => {
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
                <IconUsers />
                Vendor Users
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
      <PageHeader.End>
        <Button onClick={onAddUser} disabled={!canAddUser}>
          <IconPlus size={16} />
          New User
        </Button>
      </PageHeader.End>
    </PageHeader>
  );
};
