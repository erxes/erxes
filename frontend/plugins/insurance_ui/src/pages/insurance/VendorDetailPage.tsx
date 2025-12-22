import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  IconSandbox,
  IconBuilding,
  IconPlus,
  IconUsers,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Badge } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  useVendor,
  useVendorUsers,
  useDeleteVendorUser,
} from '~/modules/insurance/hooks';
import { VendorUser } from '~/modules/insurance/types';
import { VendorUserForm } from '~/modules/insurance/components';

export const VendorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { vendor, loading: vendorLoading } = useVendor(id!);
  const { vendorUsers, loading: usersLoading, refetch } = useVendorUsers(id);
  const { deleteVendorUser } = useDeleteVendorUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<VendorUser | undefined>();

  const handleEdit = (user: VendorUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingUser(undefined);
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteVendorUser(userId);
      refetch();
    }
  };

  if (vendorLoading) {
    return <div className="p-6">Loading vendor...</div>;
  }

  if (!vendor) {
    return <div className="p-6">Vendor not found</div>;
  }

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
                <Button variant="ghost" asChild>
                  <Link to="/insurance/vendors">
                    <IconBuilding />
                    Vendors
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost">{vendor.name}</Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={handleCreate}>
            <IconPlus size={16} />
            New User
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6 space-y-6">
          {/* Vendor Info */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <IconBuilding className="text-blue-600" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{vendor.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {vendor.offeredProducts.length} products offered
                </p>
              </div>
            </div>

            {vendor.offeredProducts.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold mb-2">Offered Products</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.offeredProducts.map((vp) => (
                    <Badge key={vp.product.id} variant="secondary">
                      {vp.product.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Vendor Users */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconUsers size={24} />
              <h3 className="text-xl font-semibold">Vendor Users</h3>
              <Badge variant="secondary">{vendorUsers.length}</Badge>
            </div>

            {usersLoading ? (
              <p className="text-muted-foreground">Loading users...</p>
            ) : vendorUsers.length === 0 ? (
              <Card className="p-12 text-center">
                <IconUsers size={64} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No users yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add users to manage this vendor
                </p>
                <Button onClick={handleCreate}>
                  <IconPlus size={16} />
                  Add First User
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendorUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {user.name || 'No name'}
                        </h4>
                        <Badge variant="secondary" className="mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {user.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <IconMail
                            size={16}
                            className="text-muted-foreground"
                          />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <IconPhone
                            size={16}
                            className="text-muted-foreground"
                          />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(user)}
                      >
                        <IconEdit size={16} />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <VendorUserForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        vendorId={id!}
        user={editingUser}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
