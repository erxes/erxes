import { ContactPanelRelationField } from '@/side-panel/components/details/ContactPanelRelationField';
import {
  IconBell,
  IconCalendar,
  IconCircle,
  IconGenderBigender,
  IconHash,
  IconMail,
  IconPhone,
  IconTag,
  IconUser,
} from '@tabler/icons-react';
import { useChangeCustomerState } from '@/contacts/customers/hooks/useChangeCustomerState';
import { format } from 'date-fns';
import {
  cn,
  DatePicker,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  ScrollArea,
  Select,
  SexCode,
  SexCodes,
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
  SelectMember,
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

const SCOPE = 'side-panel-customer';

// The phone cell, like the list, marks only valid and invalid numbers.
const toCellPhoneStatus = (status: ICustomerDetail['phoneValidationStatus']) =>
  status === 'valid' || status === 'invalid' ? status : undefined;

/** Saves the customer code without submitting the other fields. */
const CustomerCodeField = ({
  customer,
  placeholder,
}: {
  customer: ICustomerDetail;
  placeholder: string;
}) => {
  const { customerEdit } = useCustomerEdit();
  const value = customer.code || '';

  return (
    <TextField
      scope={`${SCOPE}.code`}
      value={value}
      placeholder={placeholder}
      className={cn(
        PANEL_TEXT_FIELD_CLASS_NAME,
        !value && 'text-muted-foreground',
      )}
      onSave={(code) =>
        customerEdit({ variables: { _id: customer._id, code } })
      }
    >
      {!value && (
        <IconHash
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </TextField>
  );
};

/** Edits the customer pronoun and closes its picker after selection. */
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

/** Saves a changed birth date when the date picker closes. */
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
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <IconCalendar className="size-3.5" aria-hidden="true" />
            YYYY/MM/DD
          </span>
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

/** Switches the contact between lead and customer states. */
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

/** Maps the subscription switch to the stored Yes/No values. */
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

/** Saves the customer description through the shared panel editor. */
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
        <PanelField
          icon={IconTag}
          label={t('tags', 'Tags')}
          placeholder={!customer.tagIds?.length ? t('tags', 'Tags') : undefined}
        >
          <TagsSelect.InlineCell
            maxVisible={1}
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
        <ContactPanelRelationField
          contentType="core:customer"
          contentId={customer._id}
        />
        <PanelField
          icon={IconMail}
          label={t('emails', 'Emails')}
          placeholder={
            !customer.primaryEmail && !customer.emails?.some(Boolean)
              ? t('emails', 'Emails')
              : undefined
          }
        >
          <CustomerEmails
            maxVisible={1}
            _id={customer._id}
            primaryEmail={customer.primaryEmail || ''}
            emails={customer.emails || []}
            emailValidationStatus={customer.emailValidationStatus}
            scope={`${SCOPE}.emails`}
            Trigger={PanelFieldTrigger}
          />
        </PanelField>
        <PanelField
          icon={IconPhone}
          label={t('phones', 'Phones')}
          placeholder={
            !customer.primaryPhone && !customer.phones?.some(Boolean)
              ? t('phones', 'Phones')
              : undefined
          }
        >
          <CustomerPhones
            maxVisible={1}
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
        <PanelField
          icon={IconUser}
          label={t('owner', 'Owner')}
          placeholder={!customer.ownerId ? t('owner', 'Owner') : undefined}
        >
          <SelectMember.InlineCell
            value={customer.ownerId || ''}
            scope={`${SCOPE}.owner`}
            placeholder={customer.ownerId ? t('owner', 'Owner') : ''}
            showInactive
            className="rounded-sm"
            onValueChange={(ownerId) =>
              customerEdit({
                variables: {
                  _id: customer._id,
                  ownerId: typeof ownerId === 'string' ? ownerId : '',
                },
              })
            }
          />
        </PanelField>
        <PanelField icon={IconHash} label={addT('code', 'Code')}>
          <CustomerCodeField
            customer={customer}
            placeholder={addT('code', 'Code')}
          />
        </PanelField>
        <PanelField
          icon={IconGenderBigender}
          label={t('sex', 'Sex')}
          placeholder={
            !customer.sex || !SexCodes[customer.sex as SexCode]
              ? t('sex', 'Sex')
              : undefined
          }
        >
          <CustomerSexField customer={customer} />
        </PanelField>
        <PanelField
          icon={IconCalendar}
          label={addT('birth-date', 'Birth date')}
        >
          <CustomerBirthDateField customer={customer} />
        </PanelField>
        <PanelField icon={IconCircle} label={addT('state', 'State')}>
          <CustomerStateField customer={customer} />
        </PanelField>
        <PanelField icon={IconBell} label={addT('subscribed', 'Subscribed')}>
          <CustomerSubscribedField customer={customer} />
        </PanelField>
        <CustomerDescriptionField customer={customer} />
      </div>
    </ScrollArea>
  );
};
