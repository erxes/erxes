import type { Company, Customer, Field } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import { IconEdit } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  SelectMember,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CustomFieldCell } from '~/modules/properties/CustomFieldCell';
import { useOpenPanelRecord } from '~/modules/side-panel/useSidePanel';
import { TagsSelect } from '~/modules/tags/TagsSelect';
import { useCompanyEdit } from '../companies/useCompanies';
import { useCustomerEdit } from '../customers/useCustomers';
import { ContactEmails, ContactPhones } from './ContactFields';

type Contact = Customer | Company;

type CellProps = { record: Contact; scope: string };

/** Saves a field customers and companies share, through the record's own endpoint. */
const useContactEdit = (record: Contact) => {
  const customer = useCustomerEdit();
  const company = useCompanyEdit();

  return 'primaryName' in record ? company.mutate : customer.mutate;
};

/** The row's menu: Edit opens the record in the side panel. */
export const ContactMoreCell = ({ record }: { record: Contact }) => {
  const { t } = useTranslation('contact');
  const openRecord = useOpenPanelRecord();
  const isCompany = 'primaryName' in record;

  return (
    <Popover>
      <Popover.Trigger render={<RecordTable.MoreButton className="h-full w-full" />} />
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() =>
                openRecord({
                  contentType: isCompany ? 'core:company' : 'core:customer',
                  contentId: record.id,
                })
              }
            >
              <IconEdit /> {isCompany ? t('company.action-edit') : t('customer.action-edit')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const ContactEmailsCell = ({ record, scope }: CellProps) => {
  const save = useContactEdit(record);

  return (
    <ContactEmails
      id={record.id}
      primaryEmail={record.primaryEmail}
      emails={record.emails}
      scope={scope}
      Trigger={RecordTableInlineCell.Trigger}
      onSave={(value) => save({ id: record.id, ...value })}
    />
  );
};

export const ContactPhonesCell = ({ record, scope }: CellProps) => {
  const save = useContactEdit(record);

  return (
    <ContactPhones
      id={record.id}
      primaryPhone={record.primaryPhone}
      phones={record.phones}
      scope={scope}
      Trigger={RecordTableInlineCell.Trigger}
      onSave={(value) => save({ id: record.id, ...value })}
    />
  );
};

export const ContactOwnerCell = ({ record, scope }: CellProps) => {
  const save = useContactEdit(record);

  return (
    <SelectMember.InlineCell
      scope={scope}
      value={record.ownerId}
      members={memberQueries}
      onValueChange={(ownerId) => save({ id: record.id, ownerId })}
    />
  );
};

export const ContactTagsCell = ({ record, scope }: CellProps) => {
  const save = useContactEdit(record);

  return (
    <TagsSelect.InlineCell
      type={'primaryName' in record ? 'company' : 'customer'}
      scope={scope}
      value={record.tagIds}
      onValueChange={(tagIds) => save({ id: record.id, tagIds })}
    />
  );
};

/** A custom field's value, edited in place. */
export const ContactFieldCell = ({ record, field, scope }: CellProps & { field: Field }) => {
  const save = useContactEdit(record);

  return (
    <CustomFieldCell
      field={field}
      scope={`${scope}.${record.id}.${field.id}`}
      value={record.customFields[field.id]}
      onSave={(value) => save({ id: record.id, customFields: { [field.id]: value } })}
    />
  );
};
