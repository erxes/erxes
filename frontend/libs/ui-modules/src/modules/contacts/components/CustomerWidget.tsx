import { Button, Separator, SideMenu, Spinner } from 'erxes-ui';
import {
  IconCaretDownFilled,
  IconUser,
  IconUserCog,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { CustomersInline } from './CustomersInline';
import { SelectCustomersBulk } from './SelectCustomersBulk';
import { useCustomerDetail } from '../hooks';

const CustomerWidgetItem = ({
  customerId,
  scope,
}: {
  customerId: string;
  scope: string;
}) => {
  const navigate = useNavigate();

  const { customerDetail, loading } = useCustomerDetail(
    {
      variables: {
        _id: customerId,
      },
    },
    true,
  );
  const { primaryEmail, primaryPhone } = customerDetail || {};

  if (loading) {
    return (
      <Spinner containerClassName="py-6 bg-background rounded-lg shadow-xs" />
    );
  }

  return (
    <CustomersInline.Provider
      customers={customerDetail ? [customerDetail] : []}
    >
      <div className="bg-background rounded-lg shadow-xs">
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CustomersInline.Avatar size="xl" />
            <CustomersInline.Title />
          </div>
          <div className="text-sm text-accent-foreground flex items-center gap-2 justify-between">
            Customer phone
            <span className="text-foreground">{primaryPhone || '-'}</span>
          </div>
          <div className="text-sm text-accent-foreground flex items-center gap-2 justify-between">
            Customer email
            <span className="text-foreground">{primaryEmail || '-'}</span>
          </div>
        </div>
        <Separator />
        <div className="py-1 px-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-accent-foreground"
            onClick={() =>
              navigate(`/contacts/customers?contactId=${customerId}`)
            }
          >
            View details
            <IconCaretDownFilled />
          </Button>
        </div>
      </div>
    </CustomersInline.Provider>
  );
};

export const CustomerWidget = ({
  customerIds,
  scope,
  onManageCustomers,
}: {
  customerIds: string[];
  scope: string;
  onManageCustomers?: (customerIds: string[]) => void;
}) => {
  return (
    <SideMenu.Content value="customer" className="bg-sidebar">
      <CustomerWidgetHeader
        customerIds={customerIds}
        onManageCustomers={onManageCustomers}
      />
      <CustomerWidgetContent customerIds={customerIds} scope={scope} />
    </SideMenu.Content>
  );
};

export const CustomerWidgetTrigger = () => (
  <SideMenu.Trigger value="customer" label="Customers" Icon={IconUser} />
);

const CustomerWidgetHeader = ({
  customerIds,
  onManageCustomers,
}: {
  customerIds?: string[];
  onManageCustomers?: (customerIds: string[]) => void;
}) => {
  return (
    <div className="flex items-center justify-between bg-background border-b">
      <div>
        <SideMenu.Header label="Customers" Icon={IconUser} hideSeparator />
      </div>
      {onManageCustomers && (
        <SelectCustomersBulk
          onSelect={onManageCustomers}
          customerIds={customerIds}
        >
          <Button variant="ghost" size="sm">
            <IconUserCog className="h-4 w-4" />
          </Button>
        </SelectCustomersBulk>
      )}
    </div>
  );
};

const CustomerWidgetContent = ({
  customerIds,
  scope,
  updateCustomerIds,
}: {
  customerIds: string[];
  updateCustomerIds?: (customerIds: string[]) => void;
  scope: string;
}) => {
  if (!customerIds || customerIds.length === 0) {
    return <div className="p-4">No customers found</div>;
  }

  return (
    <div className="p-4 space-y-2 overflow-y-auto">
      {customerIds.map((customerId: string) => {
        return (
          <CustomerWidgetItem
            key={customerId}
            customerId={customerId}
            scope={scope}
          />
        );
      })}
    </div>
  );
};
