import { Combobox, Label, Switch, Textarea } from 'erxes-ui';
import { CustomerDetailSelectTag } from '@/contacts/customers/customer-detail/components/CustomerDetailSelectTag';
import { TextFieldCustomer } from '@/contacts/customers/customer-detail/components/TextFieldCustomer';
import {
  CustomerEmails,
  CustomerOwner,
  useCustomerEdit,
  CustomerPhones,
} from 'ui-modules';
import { useCustomerDetailWithQuery } from '../../hooks/useCustomerDetailWithQuery';
import { DataListItem } from '@/contacts/components/ContactsDetail';

export const CustomerDetailFields = () => {
  const { customerDetail } = useCustomerDetailWithQuery();
  const { customerEdit } = useCustomerEdit();
  if (!customerDetail) return;

  const {
    primaryEmail,
    primaryPhone,
    emails,
    emailValidationStatus,
    tagIds,
    ownerId,
    code,
    _id,
    isSubscribed,
    description,
    score,
    phones,
    phoneValidationStatus,
  } = customerDetail;

  return (
    <>
      <div className="py-8 space-y-6">
        <CustomerDetailSelectTag tagIds={tagIds || []} customerId={_id} />
        <div className="px-8 space-y-2">
          <Label asChild>
            <legend>Owner</legend>
          </Label>
          <div className="inline-flex">
            <CustomerOwner _id={_id} ownerId={ownerId} />
          </div>
        </div>
        <div className="px-8 font-medium flex gap-5 flex-col">
          <div className="grid grid-cols-2 gap-5 col-span-5">
            <DataListItem label="Code">
              <TextFieldCustomer
                value={code || ''}
                placeholder="Add Code"
                field="code"
                _id={_id}
              />
            </DataListItem>
            <DataListItem label="Emails">
              <CustomerEmails
                _id={_id}
                primaryEmail={primaryEmail || ''}
                emails={emails || []}
                emailValidationStatus={emailValidationStatus || 'valid'}
                Trigger={(props) => <Combobox.TriggerBase {...props} />}
              />
            </DataListItem>
            <DataListItem label="phones">
              <CustomerPhones
                _id={_id}
                primaryPhone={primaryPhone || ''}
                phones={phones || []}
                phoneValidationStatus={phoneValidationStatus || 'valid'}
                Trigger={Combobox.TriggerBase}
              />
            </DataListItem>
            <DataListItem label="Score">
              <TextFieldCustomer
                value={score?.toString() || ''}
                placeholder="Add Score"
                field="score"
                _id={_id}
              />
            </DataListItem>
          </div>
          <DataListItem label="Subscribed">
            <Switch
              checked={isSubscribed === 'Yes'}
              onCheckedChange={(checked) => {
                customerEdit({
                  variables: {
                    _id,
                    isSubscribed: checked ? 'Yes' : 'No',
                  },
                });
              }}
            />
          </DataListItem>
          <DataListItem label="Description">
            <Textarea
              value={description || ''}
              onChange={(e) => {
                customerEdit({
                  variables: {
                    _id,
                    description: e.target.value,
                  },
                });
              }}
            />
          </DataListItem>
        </div>
      </div>
    </>
  );
};
