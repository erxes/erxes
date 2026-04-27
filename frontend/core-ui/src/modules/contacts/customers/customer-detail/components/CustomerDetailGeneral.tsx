import { Avatar, Button, FullNameValue, Popover, readImage } from 'erxes-ui';
import { useCustomerDetailWithQuery } from '@/contacts/customers/hooks/useCustomerDetailWithQuery';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { CustomerName } from 'ui-modules';

export const CustomerDetailGeneral = () => {
  const { customerDetail } = useCustomerDetailWithQuery();
  const {
    _id,
    firstName,
    lastName,
    middleName,
    primaryEmail,
    primaryPhone,
    avatar,
  } = customerDetail || {};

  return (
    <div className="py-5 px-8 flex flex-col gap-6">
      <div className="flex gap-2 items-center flex-col lg:flex-row ">
        <Avatar size="lg" className="h-12 w-12">
          <Avatar.Image src={readImage(avatar)} />
          <Avatar.Fallback>
            {(firstName || lastName || primaryEmail || primaryPhone)?.charAt(0)}
          </Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <CustomerName
            _id={_id}
            firstName={firstName}
            lastName={`${middleName || ''}${middleName ? ' ' : ''}${
              lastName || ''
            }`}
            scope={ContactsHotKeyScope.CustomerEditSheet + '.' + _id + '.Name'}
          >
            <Popover.Trigger asChild>
              <Button variant="ghost" className="text-base font-semibold">
                <FullNameValue />
              </Button>
            </Popover.Trigger>
          </CustomerName>
        </div>
      </div>
    </div>
  );
};
