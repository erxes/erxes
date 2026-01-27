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
  IconPackage,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Separator,
  Card,
  Badge,
  Dialog,
  Label,
  Select,
  Input,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  useVendor,
  useVendorUsers,
  useDeleteVendorUser,
  useInsuranceProducts,
  useAddProductToVendor,
  useRemoveProductFromVendor,
} from '~/modules/insurance/hooks';
import { VendorUser } from '~/modules/insurance/types';
import { VendorUserForm } from '~/modules/insurance/components';

export const VendorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { vendor, loading: vendorLoading } = useVendor(id!);
  const { vendorUsers, loading: usersLoading, refetch } = useVendorUsers(id);
  const { deleteVendorUser } = useDeleteVendorUser();
  const { insuranceProducts } = useInsuranceProducts();
  const { addProductToVendor } = useAddProductToVendor();
  const { removeProductFromVendor } = useRemoveProductFromVendor();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<VendorUser | undefined>();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [vendorPercentage, setVendorPercentage] = useState<number | undefined>(
    undefined,
  );
  const [vendorDurationFields, setVendorDurationFields] = useState<
    { duration: string; percentage: number }[]
  >([]);

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

  const handleAddProduct = async () => {
    if (!selectedProductId) return;

    try {
      let pricingOverride = null;

      if (vendorDurationFields.length > 0) {
        const percentageByDuration: Record<string, number> = {};
        vendorDurationFields.forEach((f) => {
          if (f.duration) {
            percentageByDuration[f.duration] = f.percentage;
          }
        });
        pricingOverride = {
          percentage: vendorPercentage,
          percentageByDuration,
        };
      } else if (vendorPercentage !== undefined && vendorPercentage !== null) {
        pricingOverride = { percentage: vendorPercentage };
      }

      await addProductToVendor({
        variables: {
          vendorId: id!,
          productId: selectedProductId,
          pricingOverride,
        },
      });

      setIsProductDialogOpen(false);
      setSelectedProductId('');
      setVendorPercentage(undefined);
      setVendorDurationFields([]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (confirm('Remove this product?')) {
      try {
        await removeProductFromVendor({
          variables: {
            vendorId: id!,
            productId,
          },
        });
      } catch (error) {
        console.error('Error removing product:', error);
      }
    }
  };

  const availableProducts = insuranceProducts.filter(
    (product) =>
      !vendor?.offeredProducts.some((vp) => vp.product.id === product.id),
  );

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

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Offered Products</h3>
                <Button size="sm" onClick={() => setIsProductDialogOpen(true)}>
                  <IconPlus size={16} />
                  Add Product
                </Button>
              </div>
              {vendor.offeredProducts.length > 0 ? (
                <div className="space-y-2">
                  {vendor.offeredProducts.map((vp: any) => (
                    <div
                      key={vp.product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <IconPackage size={20} className="text-blue-600" />
                        <p className="font-medium">{vp.product.name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(vp.product.id)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No products added yet</p>
              )}
            </div>
          </Card>

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

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>Add Product</Dialog.Title>
          </Dialog.Header>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Select Product *</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <Select.Trigger id="product">
                  <Select.Value placeholder="Select a product" />
                </Select.Trigger>
                <Select.Content>
                  {availableProducts.map((product) => (
                    <Select.Item key={product.id} value={product.id}>
                      {product.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorPercentage">
                Үндсэн хувь (%) - Сонголттой
              </Label>
              <Input
                id="vendorPercentage"
                type="number"
                min="0"
                step="0.1"
                value={vendorPercentage ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setVendorPercentage(value ? parseFloat(value) : undefined);
                }}
                placeholder="Product-ийн хувийг ашиглана"
              />
              <p className="text-xs text-muted-foreground">
                Хоосон орхивол product-ийн үндсэн хувийг ашиглана.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Хугацаагаар хувь (сонголттой)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVendorDurationFields([
                      ...vendorDurationFields,
                      { duration: '', percentage: 0 },
                    ]);
                  }}
                >
                  Хугацаа нэмэх
                </Button>
              </div>

              {vendorDurationFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Vendor-д хугацаагаар өөр хувь тохируулах бол "Хугацаа нэмэх"
                  дарна уу
                </p>
              ) : (
                <div className="space-y-2">
                  {vendorDurationFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">Хугацаа</Label>
                        <Input
                          value={field.duration}
                          onChange={(e) => {
                            const newFields = [...vendorDurationFields];
                            newFields[index] = {
                              ...newFields[index],
                              duration: e.target.value,
                            };
                            setVendorDurationFields(newFields);
                          }}
                          placeholder="12months"
                        />
                      </div>
                      <div className="w-32">
                        <Label className="text-xs">Хувь (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={field.percentage}
                          onChange={(e) => {
                            const newFields = [...vendorDurationFields];
                            newFields[index] = {
                              ...newFields[index],
                              percentage: parseFloat(e.target.value) || 0,
                            };
                            setVendorDurationFields(newFields);
                          }}
                          placeholder="2.5"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVendorDurationFields(
                            vendorDurationFields.filter((_, i) => i !== index),
                          );
                        }}
                      >
                        Устгах
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Жишээ: "12months", "24months" гэх мэт. Энэ vendor-д зориулсан
                хугацаагаар хувь.
              </p>
            </div>
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProductDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddProduct}
              disabled={!selectedProductId}
            >
              Add
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
