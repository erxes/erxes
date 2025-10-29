import {
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconUser,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Collapsible,
  Combobox,
  Label,
  Separator,
  readImage,
  Spinner,
  Popover,
  FullNameValue,
  SideMenu,
} from 'erxes-ui';
import { CustomerName } from './CustomerName';
import { useCustomerDetail } from '../hooks';
import { CustomerOwner } from './CustomerOwner';
import { CustomerEmails } from './CustomerEmails';
import { CustomerPhones } from './CustomerPhones';
import clsx from 'clsx';
import { CustomersInline } from './CustomersInline';

export const CustomerWidget = ({
  customerIds,
  scope,
}: {
  customerIds: string[];
  scope: string;
}) => {
  return (
    <SideMenu.Content value="customer" className="bg-sidebar">
      <CustomerWidgetHeader />
      <CustomerWidgetContent customerIds={customerIds} scope={scope} />
    </SideMenu.Content>
  );
};

export const CustomerWidgetTrigger = () => (
  <SideMenu.Trigger value="customer" label="Customers" Icon={IconUser} />
);

const CustomerWidgetHeader = () => {
  return <SideMenu.Header label="Customers" Icon={IconUser} />;
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
  if (customerIds.length === 1) {
    return <CustomerWidgetDetail customerId={customerIds[0]} scope={scope} />;
  }
  return (
    <div className="p-4 space-y-2">
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

const CustomerWidgetItem = ({
  customerId,
  scope,
}: {
  customerId: string;
  scope: string;
}) => {
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
          >
            View details
            <IconCaretDownFilled />
          </Button>
        </div>
      </div>
    </CustomersInline.Provider>
  );
};

const CustomerWidgetDetail = ({
  customerId,
  scope,
}: {
  customerId: string;
  scope: string;
}) => {
  const { customerDetail, loading } = useCustomerDetail({
    variables: {
      _id: customerId,
    },
  });

  const {
    avatar,
    firstName,
    lastName,
    middleName,
    ownerId,
    primaryEmail,
    emailValidationStatus,
    emails,
    primaryPhone,
    phones,
    phoneValidationStatus,
  } = customerDetail || {};

  return (
    <Collapsible className="group/collapsible-menu bg-background" defaultOpen>
      <div className="p-4">
        <Collapsible.Trigger asChild>
          <Button
            variant="ghost"
            className="w-full text-accent-foreground justify-start text-left"
            size="sm"
          >
            <IconCaretRightFilled className="transition-transform group-data-[state=open]/collapsible-menu:rotate-90" />
            Overview
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content className="pt-4">
          {loading ? (
            <Spinner containerClassName="py-20" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Avatar size="xl">
                  <Avatar.Image src={readImage(avatar || '')} />
                  <Avatar.Fallback>
                    {firstName?.charAt(0) || lastName?.charAt(0) || '-'}
                  </Avatar.Fallback>
                </Avatar>
                <CustomerName
                  _id={customerId}
                  firstName={firstName || ''}
                  lastName={`${middleName || ''}${middleName ? ' ' : ''}${
                    lastName || ''
                  }`}
                  scope={clsx(scope, 'Name')}
                >
                  <Popover.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="rounded font-medium text-base"
                    >
                      <FullNameValue />
                    </Button>
                  </Popover.Trigger>
                </CustomerName>
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <CustomerOwner
                  _id={customerId}
                  ownerId={ownerId || ''}
                  scope={clsx(scope, 'Owner')}
                />
              </div>
              <div className="space-y-2">
                <Label>Emails</Label>
                <CustomerEmails
                  primaryEmail={primaryEmail || ''}
                  _id={customerId}
                  emailValidationStatus={emailValidationStatus || 'valid'}
                  emails={emails || []}
                  Trigger={Combobox.TriggerBase}
                />
              </div>
              <div className="space-y-2">
                <Label>Phones</Label>
                <CustomerPhones
                  _id={customerId}
                  primaryPhone={primaryPhone || ''}
                  phones={phones || []}
                  phoneValidationStatus={phoneValidationStatus || 'valid'}
                  scope={clsx(scope, 'Phones')}
                  Trigger={Combobox.TriggerBase}
                />
              </div>
            </div>
          )}
        </Collapsible.Content>
      </div>
      <Separator />
    </Collapsible>
  );
};
