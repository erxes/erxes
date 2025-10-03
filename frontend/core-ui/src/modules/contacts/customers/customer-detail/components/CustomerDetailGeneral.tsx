import { FullNameValue, Label, Popover } from 'erxes-ui';
import { useCustomerDetailWithQuery } from '@/contacts/customers/hooks/useCustomerDetailWithQuery';
import { Avatar, Button, readImage } from 'erxes-ui';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { CustomerName, SelectCompany, useCustomerEdit } from 'ui-modules';

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
  const { customerEdit } = useCustomerEdit();
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
            scope={ContactsHotKeyScope.CustomerDetailPage + '.' + _id + '.Name'}
          >
            <Popover.Trigger asChild>
              <Button variant="ghost" className="text-base font-semibold">
                <FullNameValue />
              </Button>
            </Popover.Trigger>
          </CustomerName>
        </div>
      </div>
      <fieldset className="space-y-2">
        <Label asChild>
          <legend>Works At</legend>
        </Label>
        <SelectCompany.Detail
          value={customerDetail?.companies?.map((c) => c._id) || []}
          onValueChange={(value) => {
            customerEdit({
              variables: {
                _id: _id,
                companyIds: value,
              },
            });
          }}
          mode="multiple"
        />
      </fieldset>
    </div>
  );
};
