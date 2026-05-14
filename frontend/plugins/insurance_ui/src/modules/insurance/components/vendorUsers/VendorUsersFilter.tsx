import { IconSearch, IconBuilding } from '@tabler/icons-react';
import { Combobox, Command, Filter, Select } from 'erxes-ui';
import { useVendors } from '~/modules/insurance/hooks';

const VENDOR_USERS_CURSOR_SESSION_KEY = 'vendor-users-cursor';

interface VendorUsersFilterProps {
  selectedVendorId: string;
  onVendorChange: (vendorId: string) => void;
}

export const VendorUsersFilter = ({
  selectedVendorId,
  onVendorChange,
}: VendorUsersFilterProps) => {
  const { vendors, loading: vendorsLoading } = useVendors();

  return (
    <Filter
      id="vendor-users-filter"
      sessionKey={VENDOR_USERS_CURSOR_SESSION_KEY}
    >
      <Filter.Bar>
        <div className="flex items-center gap-2">
          <IconBuilding size={16} className="text-muted-foreground" />
          <Select
            value={selectedVendorId || 'all'}
            onValueChange={(value) =>
              onVendorChange(value === 'all' ? '' : value)
            }
          >
            <Select.Trigger className="w-[200px] h-7">
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
      </Filter.Bar>
    </Filter>
  );
};
