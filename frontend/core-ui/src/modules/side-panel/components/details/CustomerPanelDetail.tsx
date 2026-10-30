import { useChangeCustomerState } from '@/contacts/customers/hooks/useChangeCustomerState';
import { format } from 'date-fns';
import {
  DatePicker,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  ScrollArea,
  Select,
  SexCode,
  SexDisplay,
  SexField,
  Spinner,
  Switch,
  TextField,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CustomerEmails,
  CustomerOwner,
  CustomerPhones,
  ICustomerDetail,
  TagsSelect,
  useCustomerDetail,
  useCustomerEdit,
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelDescriptionField,
  PanelField,
  PanelFieldTrigger,
} from 'ui-modules';
import { PanelAvatarField } from './PanelAvatarField';

const SCOPE = 'side-panel-customer';

type TTextCode = 'firstName' | 'middleName' | 'lastName' | 'code';

// The phone cell, like the list, marks only valid and invalid numbers.
const toCellPhoneStatus = (status: ICustomerDetail['phoneValidationStatus']) =>
  status === 'valid' || status === 'invalid' ? status : undefined;

const CustomerTextField = ({
  customer,
  code,
  placeholder,
}: {
  customer: ICustomerDetail;
  code: TTextCode;
  placeholder: string;
}) => {
  const { customerEdit } = useCustomerEdit();
  const value = customer[code] || '';

  return (
    <TextField
      scope={`${SCOPE}.${code}`}
      value={value}
      placeholder={placeholder}
      className={PANEL_TEXT_FIELD_CLASS_NAME}
      onSave={(next) =>
        customerEdit({ variables: { _id: customer._id, [code]: next } })
      }
    />
  );
};

const CustomerSexField = ({ customer }: { customer: ICustomerDetail }) => {
  const { customerEdit } = useCustomerEdit();
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped scope={`${SCOPE}.sex`} open={open} onOpenChange={setOpen}>
      <PanelFieldTrigger>
        <SexDisplay value={customer.sex as SexCode} />
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content>
        <SexField
          value={customer.sex as SexCode}
          onValueChange={(sex) => {
            if (sex !== customer.sex) {
              customerEdit({ variables: { _id: customer._id, sex } });
            }
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const CustomerBirthDateField = ({
  customer,
}: {
  customer: ICustomerDetail;
}) => {
  const { customerEdit } = useCustomerEdit();
  const [open, setOpen] = useState(false);
  const saved = customer.birthDate ? new Date(customer.birthDate) : undefined;
  const [date, setDate] = useState(saved);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && date && date.getTime() !== saved?.getTime()) {
          customerEdit({ variables: { _id: customer._id, birthDate: date } });
        }
      }}
    >
      <PanelFieldTrigger>
        {date ? (
          format(date, 'yyyy/MM/dd')
        ) : (
          <span className="text-muted-foreground">YYYY/MM/DD</span>
        )}
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content className="w-auto">
        <DatePicker
          defaultMonth={date}
          value={date}
          onChange={(next) => setDate(next as Date)}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const CustomerStateField = ({ customer }: { customer: ICustomerDetail }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { changeCustomerState } = useChangeCustomerState();

  return (
    <Select
      value={customer.state || ''}
      onValueChange={(state) => changeCustomerState([customer._id], state)}
    >
      <Select.Trigger className="h-7 rounded-sm px-2 shadow-none hover:bg-accent">
        <Select.Value placeholder={t('state', 'State')} />
      </Select.Trigger>
      <Select.Content align="start">
        <Select.Item value="lead">{t('lead', 'Lead')}</Select.Item>
        <Select.Item value="customer">{t('customer', 'Customer')}</Select.Item>
      </Select.Content>
    </Select>
  );
};

const CustomerSubscribedField = ({
  customer,
}: {
  customer: ICustomerDetail;
}) => {
  const { customerEdit } = useCustomerEdit();

  return (
    <div className="flex h-7 items-center px-2">
      <Switch
        size="sm"
        checked={customer.isSubscribed === 'Yes'}
        onCheckedChange={(checked) =>
          customerEdit({
            variables: {
              _id: customer._id,
              isSubscribed: checked ? 'Yes' : 'No',
            },
          })
        }
      />
    </div>
  );
};

const CustomerDescriptionField = ({
  customer,
}: {
  customer: ICustomerDetail;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { customerEdit } = useCustomerEdit();

  return (
    <PanelDescriptionField
      label={t('description', 'Description')}
      value={customer.description || ''}
      scope={`${SCOPE}.description`}
      onSave={(description) =>
        customerEdit({ variables: { _id: customer._id, description } })
      }
    />
  );
};

// The customer's fields as record table cells: click a value to edit it.
export const CustomerPanelDetail = ({ customerId }: { customerId: string }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: addT } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { customerDetail, loading } = useCustomerDetail({
    variables: { _id: customerId },
    skip: !customerId,
  });
  const { customerEdit } = useCustomerEdit();

  if (loading && !customerDetail) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!customerDetail) {
    return null;
  }

  const customer = customerDetail;

  // Radix sizes its content as a table, which lets wide values push past the
  // panel; a block lets each value shrink and truncate instead.
  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-0.5 p-3">
        <PanelAvatarField
          value={customer.avatar || ''}
          onSave={(avatar) =>
            customerEdit({ variables: { _id: customer._id, avatar } })
          }
        />
        <PanelField label={addT('first-name', 'First name')}>
          <CustomerTextField
            customer={customer}
            code="firstName"
            placeholder={addT('first-name', 'First name')}
          />
        </PanelField>
        <PanelField label={addT('middle-name', 'Middle name')}>
          <CustomerTextField
            customer={customer}
            code="middleName"
            placeholder={addT('middle-name', 'Middle name')}
          />
        </PanelField>
        <PanelField label={addT('last-name', 'Last name')}>
          <CustomerTextField
            customer={customer}
            code="lastName"
            placeholder={addT('last-name', 'Last name')}
          />
        </PanelField>
        <PanelField label={t('tags', 'Tags')}>
          <TagsSelect.InlineCell
            type="core:customer"
            mode="multiple"
            scope={`${SCOPE}.tags`}
            value={customer.tagIds}
            targetIds={[customer._id]}
            className="rounded-sm"
            options={(tagIds) => ({
              update: (cache) => {
                cache.modify({
                  id: cache.identify({
                    __typename: 'Customer',
                    _id: customer._id,
                  }),
                  fields: { tagIds: () => tagIds },
                  optimistic: true,
                });
              },
            })}
          />
        </PanelField>
        <PanelField label={t('emails', 'Emails')}>
          <CustomerEmails
            _id={customer._id}
            primaryEmail={customer.primaryEmail || ''}
            emails={customer.emails || []}
            emailValidationStatus={customer.emailValidationStatus}
            scope={`${SCOPE}.emails`}
            Trigger={PanelFieldTrigger}
          />
        </PanelField>
        <PanelField label={t('phones', 'Phones')}>
          <CustomerPhones
            _id={customer._id}
            primaryPhone={customer.primaryPhone || ''}
            phones={customer.phones || []}
            phoneValidationStatus={toCellPhoneStatus(
              customer.phoneValidationStatus,
            )}
            scope={`${SCOPE}.phones`}
            Trigger={PanelFieldTrigger}
          />
        </PanelField>
        <PanelField label={t('owner', 'Owner')}>
          <CustomerOwner
            _id={customer._id}
            ownerId={customer.ownerId || ''}
            scope={`${SCOPE}.owner`}
            inTable
          />
        </PanelField>
        <PanelField label={addT('code', 'Code')}>
          <CustomerTextField
            customer={customer}
            code="code"
            placeholder={addT('code', 'Code')}
          />
        </PanelField>
        <PanelField label={t('sex', 'Sex')}>
          <CustomerSexField customer={customer} />
        </PanelField>
        <PanelField label={addT('birth-date', 'Birth date')}>
          <CustomerBirthDateField customer={customer} />
        </PanelField>
        <PanelField label={addT('state', 'State')}>
          <CustomerStateField customer={customer} />
        </PanelField>
        <PanelField label={addT('subscribed', 'Subscribed')}>
          <CustomerSubscribedField customer={customer} />
        </PanelField>
        <CustomerDescriptionField customer={customer} />
      </div>
    </ScrollArea>
  );
};
