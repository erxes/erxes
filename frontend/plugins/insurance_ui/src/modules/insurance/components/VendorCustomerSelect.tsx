import { Select } from 'erxes-ui';

interface Vendor {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
}

interface VendorCustomerSelectProps {
  vendors: Vendor[];
  customers: Customer[];
  vendorId: string;
  customerId: string;
  onVendorChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
}

export const VendorCustomerSelect = ({
  vendors,
  customers,
  vendorId,
  customerId,
  onVendorChange,
  onCustomerChange,
}: VendorCustomerSelectProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Insurance Company *
        </label>
        <Select value={vendorId} onValueChange={onVendorChange}>
          <Select.Trigger>
            <Select.Value placeholder="Select" />
          </Select.Trigger>
          <Select.Content>
            {vendors.map((vendor) => (
              <Select.Item key={vendor.id} value={vendor.id}>
                {vendor.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Customer *</label>
        <Select value={customerId} onValueChange={onCustomerChange}>
          <Select.Trigger>
            <Select.Value placeholder="Select" />
          </Select.Trigger>
          <Select.Content>
            {customers.map((customer) => (
              <Select.Item key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    </div>
  );
};
