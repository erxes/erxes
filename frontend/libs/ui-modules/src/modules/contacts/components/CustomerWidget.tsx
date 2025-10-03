import { IconCaretRightFilled } from '@tabler/icons-react';
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
} from 'erxes-ui';
import { CustomerName } from './CustomerName';
import { useCustomerDetail } from '../hooks';
import { CustomerOwner } from './CustomerOwner';
import { CustomerEmails } from './CustomerEmails';
import { CustomerPhones } from './CustomerPhones';
import clsx from 'clsx';

export const CustomerWidget = ({
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
    <Collapsible className="group/collapsible-menu" defaultOpen>
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
        <Collapsible.Content className="pt-2">
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
