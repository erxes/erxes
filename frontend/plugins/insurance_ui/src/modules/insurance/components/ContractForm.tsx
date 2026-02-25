import { useState } from 'react';
import { Dialog, Button, Label, Input, Select } from 'erxes-ui';
import { IconEye, IconFileText } from '@tabler/icons-react';
import {
  useInsuranceProducts,
  useVendors,
  useCustomers,
  useCreateInsuranceContract,
} from '../hooks';

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ContractForm = ({
  open,
  onOpenChange,
  onSuccess,
}: ContractFormProps) => {
  const { insuranceProducts, loading: productsLoading } =
    useInsuranceProducts();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { customers, loading: customersLoading } = useCustomers();
  const { createInsuranceContract, loading: creating } =
    useCreateInsuranceContract();

  const [formData, setFormData] = useState({
    vendorId: '',
    customerId: '',
    productId: '',
    startDate: '',
    endDate: '',
    insuredObject: { assessedValue: 0 },
    paymentKind: 'cash',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createInsuranceContract({
        variables: {
          vendorId: formData.vendorId,
          customerId: formData.customerId,
          productId: formData.productId,
          insuredObject: formData.insuredObject,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          paymentKind: formData.paymentKind,
        },
      });

      setFormData({
        vendorId: '',
        customerId: '',
        productId: '',
        startDate: '',
        endDate: '',
        insuredObject: { assessedValue: 0 },
        paymentKind: 'cash',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>Create New Insurance Contract</Dialog.Title>
        </Dialog.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor *</Label>
              <Select
                value={formData.vendorId}
                onValueChange={(value) =>
                  setFormData({ ...formData, vendorId: value })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select vendor" />
                </Select.Trigger>
                <Select.Content>
                  {vendorsLoading ? (
                    <Select.Item value="loading" disabled>
                      Loading...
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

            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) =>
                  setFormData({ ...formData, customerId: value })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select customer" />
                </Select.Trigger>
                <Select.Content>
                  {customersLoading ? (
                    <Select.Item value="loading" disabled>
                      Loading...
                    </Select.Item>
                  ) : (
                    customers.map((customer) => (
                      <Select.Item key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </Select.Item>
                    ))
                  )}
                </Select.Content>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productId">Product *</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) =>
                setFormData({ ...formData, productId: value })
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select product" />
              </Select.Trigger>
              <Select.Content>
                {productsLoading ? (
                  <Select.Item value="loading" disabled>
                    Loading...
                  </Select.Item>
                ) : (
                  insuranceProducts.map((product) => (
                    <Select.Item key={product.id} value={product.id}>
                      {product.name}
                    </Select.Item>
                  ))
                )}
              </Select.Content>
            </Select>
          </div>

          {formData.productId &&
            (() => {
              const selectedProduct = insuranceProducts.find(
                (p) => p.id === formData.productId,
              );
              if (selectedProduct?.pdfContent) {
                return (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconFileText size={20} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          PDF contract available
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const previewWindow = window.open('', '_blank');
                          if (previewWindow) {
                            previewWindow.document.write(
                              selectedProduct.pdfContent || '',
                            );
                            previewWindow.document.close();
                          }
                        }}
                      >
                        <IconEye size={16} />
                        Preview
                      </Button>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

          <div className="space-y-2">
            <Label htmlFor="assessedValue">Assessed Value *</Label>
            <Input
              id="assessedValue"
              type="number"
              value={formData.insuredObject.assessedValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  insuredObject: {
                    ...formData.insuredObject,
                    assessedValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentKind">Payment Method *</Label>
            <Select
              value={formData.paymentKind}
              onValueChange={(value) =>
                setFormData({ ...formData, paymentKind: value })
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select payment method" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="cash">Cash</Select.Item>
                <Select.Item value="qpay">QPay</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                creating ||
                !formData.vendorId ||
                !formData.customerId ||
                !formData.productId
              }
            >
              {creating ? 'Creating...' : 'Create Contract'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
