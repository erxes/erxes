import type { Customer } from '@erxes/core-contract';
import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconGenderBigender,
  IconHash,
} from '@tabler/icons-react';
import {
  DateField,
  PopoverScoped,
  RecordTableInlineCell,
  SexDisplay,
  SexField,
  Spinner,
  PanelField,
  PanelFieldTrigger,
  PanelSection,
  usePanelExpanded,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomerAccountsSection } from '~/modules/contacts/customers/CustomerAccountsSection';
import { sexCodeOf } from '~/modules/contacts/customers/sexCode';
import { useCustomer, useCustomerEdit } from '~/modules/contacts/customers/useCustomers';
import { LeadPanelSection } from '~/modules/leads/LeadPanelSection';
import { LeadStageField } from '~/modules/leads/LeadStageField';
import { PluginRecordSections } from '~/modules/plugins/PluginRecordSections';
import {
  ContactChannelsSection,
  ContactDetailScroll,
  ContactOwnerField,
  ContactTextField,
  useEmptyText,
} from './ContactDetailFields';
import { ContactDescriptionField } from './ContactPanelDescription';
import { ContactPanelRelationField } from './ContactPanelRelationField';
import { ContactPanelTags } from './ContactPanelTags';

const SCOPE = 'side-panel-customer';

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
  const empty = useEmptyText();

  return (
    <PanelField icon={TEXT_FIELD_ICONS[code]} label={label}>
      <ContactTextField
        scope={`${SCOPE}.${code}`}
        value={customer[code] || ''}
        placeholder={empty}
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

/** The birth date, saved as soon as a day is picked or typed. */
const CustomerBirthDateField = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();

  return (
    <DateField
      scope={`${SCOPE}.birth-date`}
      value={customer.birthDate}
      placeholder="YYYY/MM/DD"
      variant="field"
      onSave={(birthDate) => edit.mutate({ id: customer.id, birthDate })}
    >
      {!customer.birthDate && (
        <IconCalendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
    </DateField>
  );
};

/** Sex, birth date, position and department. */
const CustomerPersonalSections = ({ customer }: { customer: Customer }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { t: addT } = useTranslation('contact', { keyPrefix: 'customer.add' });

  return (
    <>
      <PanelSection title={sectionT('personal', 'Personal')} nested>
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
      </PanelSection>
      <PanelSection title={sectionT('work', 'Work')} nested>
        <CustomerTextRow customer={customer} code="position" label={t('position', 'Position')} />
        <CustomerTextRow
          customer={customer}
          code="department"
          label={t('department', 'Department')}
        />
      </PanelSection>
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

  if (isPending) return <Spinner area="lg" />;

  if (!customer) return null;

  return (
    <ContactDetailScroll>
      <div className="border-b px-3 pb-2">
        <PanelSection title={sectionT('general', 'General')} nested>
          <ContactOwnerField
            label={t('owner', 'Owner')}
            scope={`${SCOPE}.owner`}
            ownerId={customer.ownerId}
            onChange={(ownerId) => edit.mutate({ id: customer.id, ownerId })}
          />
          <CustomerTextRow customer={customer} code="code" label={addT('code', 'Code')} />
          <LeadStageField recordType="customer" record={customer} />
        </PanelSection>
        <LeadPanelSection recordType="customer" record={customer} />
        <ContactChannelsSection
          title={sectionT('contact', 'Contact')}
          labels={{ emails: t('emails', 'Emails'), phones: t('phones', 'Phones') }}
          scope={SCOPE}
          contact={customer}
          onSave={(value) => edit.mutate({ id: customer.id, ...value })}
        />
        <CustomerPersonalSections customer={customer} />
        <CustomerAccountsSection customerId={customer.id} />
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
      <PluginRecordSections contentType="core:customer" contentId={customer.id} />
    </ContactDetailScroll>
  );
};
