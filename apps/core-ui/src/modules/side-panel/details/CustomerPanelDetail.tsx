import type { Customer } from '@erxes/core-contract';
import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconGenderBigender,
  IconHash,
} from '@tabler/icons-react';
import {
  DatePicker,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  SexDisplay,
  SexField,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toYmd } from '~/components/inlineCells';
import { sexCodeOf } from '~/modules/contacts/customers/sexCode';
import { useCustomer, useCustomerEdit } from '~/modules/contacts/customers/useCustomers';
import { LeadPanelSection } from '~/modules/leads/LeadPanelSection';
import { LeadStageField } from '~/modules/leads/LeadStageField';
import { PanelField, PanelFieldTrigger } from '../PanelField';
import { usePanelExpanded } from '../RecordSidePanel';
import {
  ContactChannelsSection,
  ContactDetailScroll,
  ContactOwnerField,
  ContactTextField,
} from './ContactDetailFields';
import { ContactDetailSection } from './ContactDetailSection';
import { ContactDescriptionField } from './ContactPanelDescription';
import { ContactPanelRelationField } from './ContactPanelRelationField';
import { ContactPanelTags } from './ContactPanelTags';

const SCOPE = 'side-panel-customer';

/** `YYYY-MM-DD` → a local date, `YYYY/MM/DD` for display. */
const parseYmd = (value: string | null) => (value ? new Date(`${value}T00:00:00`) : undefined);

const formatSlashDate = (date: Date) => toYmd(date).replaceAll('-', '/');

type TTextCode = 'code' | 'position' | 'department';

const TEXT_FIELD_ICONS: Record<TTextCode, typeof IconHash> = {
  code: IconHash,
  position: IconBriefcase,
  department: IconBuildingSkyscraper,
};

/** One text field of the customer, with its label, saved without touching the others. */
const CustomerTextRow = ({
  customer,
  code,
  label,
}: {
  customer: Customer;
  code: TTextCode;
  label: string;
}) => {
  const edit = useCustomerEdit();

  return (
    <PanelField icon={TEXT_FIELD_ICONS[code]} label={label}>
      <ContactTextField
        scope={`${SCOPE}.${code}`}
        value={customer[code] || ''}
        placeholder={label}
        icon={TEXT_FIELD_ICONS[code]}
        onSave={(next) => edit.mutate({ id: customer.id, [code]: next })}
      />
    </PanelField>
  );
};

/** Edits the customer pronoun and closes its picker after selection. */
const CustomerSexField = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const [open, setOpen] = useState(false);
  const value = sexCodeOf(customer);

  return (
    <PopoverScoped scope={`${SCOPE}.sex`} open={open} onOpenChange={setOpen}>
      <PanelFieldTrigger>
        <SexDisplay value={value} />
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content>
        <SexField
          value={value}
          onValueChange={(sex) => {
            if (sex !== value) edit.mutate({ id: customer.id, sex });
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
  const [date, setDate] = useState(() => parseYmd(customer.birthDate));
  const [savedDate, setSavedDate] = useState(customer.birthDate);

  // A date saved elsewhere replaces the one being picked.
  if (savedDate !== customer.birthDate) {
    setSavedDate(customer.birthDate);
    setDate(parseYmd(customer.birthDate));
  }

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

/** Sex, birth date, position and department. */
const CustomerPersonalSections = ({ customer }: { customer: Customer }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { t: addT } = useTranslation('contact', { keyPrefix: 'customer.add' });

  return (
    <>
      <ContactDetailSection title={sectionT('personal', 'Personal')} nested>
        <PanelField
          icon={IconGenderBigender}
          label={t('sex', 'Sex')}
          placeholder={customer.sex ? undefined : t('sex', 'Sex')}
        >
          <CustomerSexField customer={customer} />
        </PanelField>
        <PanelField icon={IconCalendar} label={addT('birth-date', 'Birth date')}>
          <CustomerBirthDateField customer={customer} />
        </PanelField>
      </ContactDetailSection>
      <ContactDetailSection title={sectionT('work', 'Work')} nested>
        <CustomerTextRow customer={customer} code="position" label={t('position', 'Position')} />
        <CustomerTextRow
          customer={customer}
          code="department"
          label={t('department', 'Department')}
        />
      </ContactDetailSection>
    </>
  );
};

// The customer's fields as record table cells: click a value to edit it.
export const CustomerPanelDetail = ({ customerId }: { customerId: string }) => {
  const expanded = usePanelExpanded();
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { t: addT } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { data: customer, isPending } = useCustomer(customerId);
  const edit = useCustomerEdit();

  if (isPending) return <Spinner containerClassName="py-12" />;

  if (!customer) return null;

  return (
    <ContactDetailScroll>
      <div className="border-b px-3 pb-2">
        <ContactDetailSection title={sectionT('general', 'General')} nested>
          <ContactOwnerField
            label={t('owner', 'Owner')}
            scope={`${SCOPE}.owner`}
            ownerId={customer.ownerId}
            onChange={(ownerId) => edit.mutate({ id: customer.id, ownerId })}
          />
          <CustomerTextRow customer={customer} code="code" label={addT('code', 'Code')} />
          <LeadStageField recordType="customer" record={customer} />
        </ContactDetailSection>
        <LeadPanelSection recordType="customer" record={customer} />
        <ContactChannelsSection
          title={sectionT('contact', 'Contact')}
          labels={{ emails: t('emails', 'Emails'), phones: t('phones', 'Phones') }}
          scope={SCOPE}
          contact={customer}
          onSave={(value) => edit.mutate({ id: customer.id, ...value })}
        />
        <CustomerPersonalSections customer={customer} />
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
    </ContactDetailScroll>
  );
};
