import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconSandbox,
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconBuilding,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Badge, Select } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  useVendorUsers,
  useVendors,
  useDeleteVendorUser,
} from '~/modules/insurance/hooks';
import { VendorUser } from '~/modules/insurance/types';
import { VendorUserForm } from '~/modules/insurance/components';

export const VendorUsersPage = () => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const { vendors, loading: vendorsLoading } = useVendors();
  const {
    vendorUsers,
    loading: usersLoading,
    refetch,
  } = useVendorUsers(selectedVendorId || undefined);
  const { deleteVendorUser } = useDeleteVendorUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<VendorUser | undefined>();

  const handleEdit = (user: VendorUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    if (!selectedVendorId) {
      alert('Please select a vendor first');
      return;
    }
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
          <Button onClick={handleCreate} disabled={!selectedVendorId}>
            <IconPlus size={16} />
            New User
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Vendor Users</h1>
              <p className="text-muted-foreground mt-1">
                Manage users for insurance vendors
              </p>
            </div>
          </div>

          {/* Vendor Filter */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Label className="font-semibold min-w-[100px]">
                Filter by Vendor:
              </Label>
              <Select
                value={selectedVendorId || 'all'}
                onValueChange={(value) =>
                  setSelectedVendorId(value === 'all' ? '' : value)
                }
              >
                <Select.Trigger className="w-[300px]">
                  <Select.Value placeholder="All Vendors" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All Vendors</Select.Item>
                  {vendorsLoading ? (
                    <Select.Item value="loading" disabled>
                      Loading vendors...
                    </Select.Item>
                  ) : (
                    vendors.map((vendor) => (
                      <Select.Item key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </Select.Item>
                    ))
                  )}
                </Select.Content>
              </Select>
            </div>
          </Card>

          {/* Users List */}
          <div>
            {usersLoading ? (
              <p className="text-muted-foreground">Loading users...</p>
            ) : vendorUsers.length === 0 ? (
              <Card className="p-12 text-center">
                <IconUsers size={64} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedVendorId
                    ? 'This vendor has no users yet'
                    : 'Select a vendor to view or add users'}
                </p>
                {selectedVendorId && (
                  <Button onClick={handleCreate}>
                    <IconPlus size={16} />
                    Add First User
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendorUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {user.name || 'No name'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{user.role}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {user.vendor && (
                        <div className="flex items-center gap-2 text-sm">
                          <IconBuilding
                            size={16}
                            className="text-muted-foreground"
                          />
                          <span className="truncate font-medium">
                            {user.vendor.name}
                          </span>
                        </div>
                      )}
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

                    <div className="pt-4 border-t flex gap-2">
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

      {selectedVendorId && (
        <VendorUserForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          vendorId={selectedVendorId}
          user={editingUser}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

// Label component (if not available from erxes-ui)
const Label = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <label className={`text-sm ${className}`}>{children}</label>;
};
