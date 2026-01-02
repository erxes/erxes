import { useState } from 'react';
import { Dialog, Button, Label, Input, Select } from 'erxes-ui';
import { useInsuranceProducts } from '../hooks';
import { useCreateInsuranceContract } from '../hooks/useContracts';

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContractForm = ({ open, onOpenChange }: ContractFormProps) => {
  const { insuranceProducts, loading: productsLoading } =
    useInsuranceProducts();
  const { createInsuranceContract, loading: creating } =
    useCreateInsuranceContract();

  const [formData, setFormData] = useState({
    vendorId: '',
    customerId: '',
    productId: '',
    startDate: '',
    endDate: '',
    insuredObject: {},
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

      // Reset form and close dialog
      setFormData({
        vendorId: '',
        customerId: '',
        productId: '',
        startDate: '',
        endDate: '',
        insuredObject: {},
        paymentKind: 'cash',
      });
      onOpenChange(false);
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
              <Label htmlFor="vendorId">Vendor ID</Label>
              <Input
                id="vendorId"
                value={formData.vendorId}
                onChange={(e) =>
                  setFormData({ ...formData, vendorId: e.target.value })
                }
                placeholder="Enter vendor ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                value={formData.customerId}
                onChange={(e) =>
                  setFormData({ ...formData, customerId: e.target.value })
                }
                placeholder="Enter customer ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productId">Insurance Product</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) =>
                setFormData({ ...formData, productId: value })
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select a product" />
              </Select.Trigger>
              <Select.Content>
                {productsLoading ? (
                  <Select.Item value="loading" disabled>
                    Loading products...
                  </Select.Item>
                ) : (
                  insuranceProducts.map((product) => (
                    <Select.Item key={product.id} value={product.id}>
                      {product.name} - {product.insuranceType.name}
                    </Select.Item>
                  ))
                )}
              </Select.Content>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
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
              <Label htmlFor="endDate">End Date</Label>
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
            <Label htmlFor="paymentKind">Payment Method</Label>
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

          <div className="space-y-2">
            <Label htmlFor="insuredObject">Insured Object (JSON)</Label>
            <textarea
              id="insuredObject"
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={JSON.stringify(formData.insuredObject, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData({ ...formData, insuredObject: parsed });
                } catch (error) {
                  // Invalid JSON, keep the text as is
                }
              }}
              placeholder='{"property": "value"}'
            />
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
            <Button type="submit" disabled={creating || productsLoading}>
              {creating ? 'Creating...' : 'Create Contract'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
