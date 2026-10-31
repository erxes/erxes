import { useTranslation } from 'react-i18next';
import { Select } from 'erxes-ui';
import type { InsuranceCustomer, InsuranceVendor } from '../types';

interface VendorCustomerSelectProps {
  vendors: Pick<InsuranceVendor, 'id' | 'name'>[];
  customers: Pick<InsuranceCustomer, 'id' | 'firstName' | 'lastName'>[];
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
  const { t } = useTranslation('insurance');
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('insurance-company-required')}
        </label>
        <Select value={vendorId} onValueChange={onVendorChange}>
          <Select.Trigger>
            <Select.Value placeholder={t('select')} />
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
        <label className="block text-sm font-medium mb-2">{t('customer-required')}</label>
        <Select value={customerId} onValueChange={onCustomerChange}>
          <Select.Trigger>
            <Select.Value placeholder={t('select')} />
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
