import { useState } from 'react';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconSandbox, IconBuilding, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { VendorForm } from '../VendorForm';
import { useVendors } from '~/modules/insurance/hooks';

export const VendorsHeader = () => {
  const { t } = useTranslation('insurance');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { refetch } = useVendors();

  const handleCreate = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <>
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
                  <IconBuilding />
                  {t('vendors')}
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={handleCreate}>
            <IconPlus size={16} />
            {t('new-vendor')}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <VendorForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleSuccess}
      />
    </>
  );
};
