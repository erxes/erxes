import { useState } from 'react';
import {
  IconSandbox,
  IconPlus,
  IconBuilding,
  IconPackage,
  IconEdit,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Badge } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useVendors } from '~/modules/insurance/hooks';
import { VendorForm } from '~/modules/insurance/components';
import { InsuranceVendor } from '~/modules/insurance/types';

export const VendorsPage = () => {
  const { vendors, loading, refetch } = useVendors();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<
    InsuranceVendor | undefined
  >();

  const handleEdit = (vendor: InsuranceVendor) => {
    setEditingVendor(vendor);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingVendor(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingVendor(undefined);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/insurance">
                    <IconSandbox />
                    Insurance
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconBuilding />
                  Vendors
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
            New Vendor
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          {loading ? (
            <p className="text-muted-foreground">Loading vendors...</p>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <IconBuilding size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No vendors yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first insurance vendor
              </p>
              <Button onClick={handleCreate}>
                <IconPlus size={16} />
                Create First Vendor
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor) => (
                <Card
                  key={vendor.id}
                  className="p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconBuilding className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{vendor.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {vendor.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconPackage
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm">
                        {vendor.offeredProducts.length} products offered
                      </span>
                    </div>

                    {vendor.offeredProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {vendor.offeredProducts.slice(0, 3).map((vp) => (
                          <Badge
                            key={vp.product.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {vp.product.name}
                          </Badge>
                        ))}
                        {vendor.offeredProducts.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{vendor.offeredProducts.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(vendor)}
                    >
                      <IconEdit size={16} />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/insurance/vendors/${vendor.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <VendorForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        vendor={editingVendor}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
