import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconSandbox, IconUsers, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface VendorUsersHeaderProps {
  onAddUser: () => void;
  canAddUser: boolean;
}

export const VendorUsersHeader = ({
  onAddUser,
  canAddUser,
}: VendorUsersHeaderProps) => {
  const { t } = useTranslation('insurance');
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/insurance/products">
                  <IconSandbox />
                  {t('insurance')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Button variant="ghost">
                <IconUsers />
                {t('vendor-users')}
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
          {t('new-user')}
        </Button>
      </PageHeader.End>
    </PageHeader>
  );
};
