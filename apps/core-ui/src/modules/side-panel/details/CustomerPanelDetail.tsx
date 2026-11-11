import type { Customer, CustomerState } from '@erxes/core-contract';
import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCircle,
  IconGenderBigender,
  IconHash,
  IconMail,
  IconPhone,
  IconUser,
} from '@tabler/icons-react';
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
  TextField,
} from 'erxes-ui';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toYmd } from '~/components/inlineCells';
import { ContactEmails, ContactPhones } from '~/modules/contacts/components/ContactFields';
import { SelectMember } from '~/modules/contacts/components/SelectMember';
import { useCustomer, useCustomerEdit } from '~/modules/contacts/customers/useCustomers';
import { PANEL_TEXT_FIELD_CLASS_NAME, PanelField, PanelFieldTrigger } from '../PanelField';
import { usePanelExpanded } from '../RecordSidePanel';
import { ContactDetailSection } from './ContactDetailSection';
import { ContactDescriptionField } from './ContactPanelDescription';
import { ContactPanelRelationField } from './ContactPanelRelationField';
import { ContactPanelTags } from './ContactPanelTags';

const SCOPE = 'side-panel-customer';

/** `YYYY-MM-DD` → a local date, `YYYY/MM/DD` for display. */
const parseYmd = (value: string | null) => {
  if (!value) return undefined;

  const [year, month, day] = value.split('-').map(Number);

  return new Date(year!, month! - 1, day!);
};

const formatSlashDate = (date: Date) => toYmd(date).replaceAll('-', '/');

type TTextCode = 'code' | 'position' | 'department';

const TEXT_FIELD_ICONS: Record<TTextCode, typeof IconHash> = {
  code: IconHash,
  position: IconBriefcase,
  department: IconBuildingSkyscraper,
};

/** Saves one text field of the customer without touching the others. */
const CustomerTextField = ({
  customer,
  code,
  placeholder,
}: {
  customer: Customer;
  code: TTextCode;
  placeholder: string;
}) => {
  const edit = useCustomerEdit();
  const value = customer[code] || '';
  const Icon = TEXT_FIELD_ICONS[code];

  return (
    <TextField
      scope={`${SCOPE}.${code}`}
      value={value}
      placeholder={placeholder}
      className={cn(PANEL_TEXT_FIELD_CLASS_NAME, !value && 'text-muted-foreground')}
      onSave={(next) => {
        if (next.trim() !== value) edit.mutate({ id: customer.id, [code]: next.trim() || null });
      }}
    >
      {!value && <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
    </TextField>
  );
};

/** Edits the customer pronoun and closes its picker after selection. */
const CustomerSexField = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const [open, setOpen] = useState(false);
  const value = (customer.sex ?? SexCode.NOT_KNOWN) as SexCode;

  return (
    <PopoverScoped scope={`${SCOPE}.sex`} open={open} onOpenChange={setOpen}>
      <PanelFieldTrigger>
        <SexDisplay value={value} />
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content>
        <SexField
          value={value}
          onValueChange={(sex) => {
            if (sex !== value) edit.mutate({ id: customer.id, sex: sex as Customer['sex'] });
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** Saves a changed birth date when the date picker closes. */
const CustomerBirthDateField = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const [open, setOpen] = useState(false);
  const saved = parseYmd(customer.birthDate);
  const [date, setDate] = useState(saved);

  useEffect(() => setDate(parseYmd(customer.birthDate)), [customer.birthDate]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next && date && toYmd(date) !== customer.birthDate) {
          edit.mutate({ id: customer.id, birthDate: toYmd(date) });
        }
      }}
    >
      <PanelFieldTrigger>
        {date ? (
          formatSlashDate(date)
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
          onChange={(next) => setDate(next instanceof Date ? next : undefined)}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

/** Switches the contact between lead and customer states. */
const CustomerStateField = ({ customer }: { customer: Customer }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const edit = useCustomerEdit();

  return (
    <Select
      value={customer.state}
      onValueChange={(state) => {
        if (state !== customer.state)
          edit.mutate({ id: customer.id, state: state as CustomerState });
      }}
    >
      <Select.Trigger className="h-7 rounded-sm px-2 shadow-none hover:bg-accent">
        <Select.Value placeholder={t('state', 'State')} />
      </Select.Trigger>
      <Select.Content align="start">
        <Select.Item value="lead">{t('state-lead', 'Lead')}</Select.Item>
        <Select.Item value="customer">{t('state-customer', 'Customer')}</Select.Item>
      </Select.Content>
    </Select>
  );
};

// The customer's fields as record table cells: click a value to edit it.
export const CustomerPanelDetail = ({
  customerId,
  children,
}: {
  customerId: string;
  /** Sections drawn under the customer's own fields. */
  children?: ReactNode;
}) => {
  const expanded = usePanelExpanded();
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { t: addT } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { data: customer, isPending } = useCustomer(customerId);
  const edit = useCustomerEdit();

  if (isPending) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!customer) {
    return null;
  }

  // Radix sizes its content as a table, which lets wide values push past the
  // panel; a block lets each value shrink and truncate instead.
  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div>
        <div className="border-b px-3 pb-2">
          <ContactDetailSection title={sectionT('general', 'General')} nested>
            <PanelField
              icon={IconUser}
              label={t('owner', 'Owner')}
              placeholder={!customer.ownerId ? t('owner', 'Owner') : undefined}
            >
              <SelectMember.InlineCell
                value={customer.ownerId}
                scope={`${SCOPE}.owner`}
                placeholder={customer.ownerId ? t('owner', 'Owner') : ''}
                className="rounded-sm"
                onValueChange={(ownerId) =>
                  edit.mutate({
                    id: customer.id,
                    ownerId: typeof ownerId === 'string' ? ownerId : null,
                  })
                }
              />
            </PanelField>
            <PanelField icon={IconHash} label={addT('code', 'Code')}>
              <CustomerTextField
                customer={customer}
                code="code"
                placeholder={addT('code', 'Code')}
              />
            </PanelField>
            <PanelField icon={IconCircle} label={addT('state', 'State')}>
              <CustomerStateField customer={customer} />
            </PanelField>
          </ContactDetailSection>
          <ContactDetailSection title={sectionT('contact', 'Contact')} nested>
            <PanelField
              icon={IconMail}
              label={t('emails', 'Emails')}
              placeholder={
                !customer.primaryEmail && !customer.emails.some(Boolean)
                  ? t('emails', 'Emails')
                  : undefined
              }
            >
              <ContactEmails
                maxVisible={1}
                id={customer.id}
                primaryEmail={customer.primaryEmail}
                emails={customer.emails}
                scope={`${SCOPE}.emails`}
                Trigger={PanelFieldTrigger}
                onSave={(value) => edit.mutate({ id: customer.id, ...value })}
              />
            </PanelField>
            <PanelField
              icon={IconPhone}
              label={t('phones', 'Phones')}
              placeholder={
                !customer.primaryPhone && !customer.phones.some(Boolean)
                  ? t('phones', 'Phones')
                  : undefined
              }
            >
              <ContactPhones
                maxVisible={1}
                id={customer.id}
                primaryPhone={customer.primaryPhone}
                phones={customer.phones}
                scope={`${SCOPE}.phones`}
                Trigger={PanelFieldTrigger}
                onSave={(value) => edit.mutate({ id: customer.id, ...value })}
              />
            </PanelField>
          </ContactDetailSection>
          <ContactDetailSection title={sectionT('personal', 'Personal')} nested>
            <PanelField
              icon={IconGenderBigender}
              label={t('sex', 'Sex')}
              placeholder={
                !customer.sex || !SexCodes[customer.sex as SexCode] ? t('sex', 'Sex') : undefined
              }
            >
              <CustomerSexField customer={customer} />
            </PanelField>
            <PanelField icon={IconCalendar} label={addT('birth-date', 'Birth date')}>
              <CustomerBirthDateField customer={customer} />
            </PanelField>
          </ContactDetailSection>
          {/* Not in old erxes's panel; core keeps a customer's job here. */}
          <ContactDetailSection title={sectionT('work', 'Work')} nested>
            <PanelField icon={IconBriefcase} label={t('position', 'Position')}>
              <CustomerTextField
                customer={customer}
                code="position"
                placeholder={t('position', 'Position')}
              />
            </PanelField>
            <PanelField icon={IconBuildingSkyscraper} label={t('department', 'Department')}>
              <CustomerTextField
                customer={customer}
                code="department"
                placeholder={t('department', 'Department')}
              />
            </PanelField>
          </ContactDetailSection>
          {!expanded && (
            <ContactDescriptionField
              contentType="core:customer"
              contentId={customer.id}
              value={customer.description || ''}
            />
          )}
        </div>
        <ContactPanelTags
          contentType="core:customer"
          contentId={customer.id}
          tagIds={customer.tagIds}
        />
        <ContactPanelRelationField contentType="core:customer" contentId={customer.id} />
      </div>
      {children}
    </ScrollArea>
  );
};
