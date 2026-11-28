import type {
  Company,
  CompanyMergeField,
  Customer,
  CustomerMergeField,
} from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import { companyTitle, customerTitle, MemberInline, SexDisplay } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompaniesMerge } from '../companies/useCompanies';
import { sexCodeOf } from '../customers/sexCode';
import { useCustomersMerge } from '../customers/useCustomers';
import { type MergeField, MergeDialog } from './MergeDialog';

interface MergeProps<Row> {
  records: Row[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Above the records: how a record's own page picks the one to merge with. */
  picker?: ReactNode;
  onMerged: (keptId: string) => void;
}

const Avatar = ({ url }: { url: string | null }) =>
  url ? <img src={url} alt="" className="size-6 rounded-full object-cover" /> : null;

const Owner = ({ id }: { id: string | null }) => (
  <MemberInline memberId={id} members={memberQueries} size="sm" />
);

/** Customer fields as the merge dialog lists them. */
const useCustomerFields = (): MergeField<Customer, CustomerMergeField>[] => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });

  return [
    { key: 'firstName', label: t('add.first-name') },
    { key: 'middleName', label: t('add.middle-name') },
    { key: 'lastName', label: t('add.last-name') },
    { key: 'avatarUrl', label: t('add.picture'), show: (row) => <Avatar url={row.avatarUrl} /> },
    { key: 'primaryEmail', label: t('add.email') },
    { key: 'primaryPhone', label: t('add.phone') },
    {
      key: 'sex',
      label: t('sex'),
      isSet: (row) => Boolean(row.sex),
      show: (row) => <SexDisplay value={sexCodeOf(row)} />,
    },
    { key: 'birthDate', label: t('birth-date') },
    { key: 'position', label: t('position') },
    { key: 'department', label: t('department') },
    { key: 'code', label: t('add.code') },
    { key: 'description', label: t('add.description') },
    { key: 'ownerId', label: t('owner'), show: (row) => <Owner id={row.ownerId} /> },
  ];
};

/** Company fields as the merge dialog lists them. */
const useCompanyFields = (): MergeField<Company, CompanyMergeField>[] => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });

  return [
    { key: 'primaryName', label: t('field.primaryName') },
    {
      key: 'avatarUrl',
      label: t('field.picture'),
      show: (row) => <Avatar url={row.avatarUrl} />,
    },
    { key: 'primaryEmail', label: t('field.email') },
    { key: 'primaryPhone', label: t('field.phone') },
    { key: 'website', label: t('field.website') },
    { key: 'industry', label: t('field.industry') },
    { key: 'size', label: t('field.size') },
    { key: 'businessType', label: t('field.businessType') },
    { key: 'code', label: t('field.code') },
    { key: 'description', label: t('field.description') },
    { key: 'ownerId', label: t('owner'), show: (row) => <Owner id={row.ownerId} /> },
  ];
};

/** Merges the records into the one kept, each field from the record picked for it. */
const ContactMerge = <Row extends Customer | Company, Key extends keyof Row & string>({
  kind,
  fields,
  title,
  merge,
  records,
  open,
  onOpenChange,
  picker,
  onMerged,
}: MergeProps<Row> & {
  kind: 'customer' | 'company';
  fields: MergeField<Row, Key>[];
  title: (row: Row) => string;
  merge: {
    isPending: boolean;
    mutate: (
      input: { ids: string[]; keepId: string; fields: Partial<Record<Key, string>> },
      options: { onSuccess: (kept: { id: string }) => void },
    ) => void;
  };
}) => {
  const { t } = useTranslation('contact');

  return (
    <MergeDialog
      open={open}
      onOpenChange={onOpenChange}
      kind={kind}
      records={records}
      fields={fields}
      merging={merge.isPending}
      picker={picker}
      head={(row) => ({
        title: title(row) || t('unnamed', 'Unnamed'),
        details: [row.state === 'lead' ? t('lead._', 'Lead') : ''],
      })}
      onMerge={(keepId, picked) =>
        merge.mutate(
          { ids: records.map((record) => record.id), keepId, fields: picked },
          { onSuccess: (kept) => onMerged(kept.id) },
        )
      }
    />
  );
};

export const CustomersMerge = (props: MergeProps<Customer>) => {
  const fields = useCustomerFields();
  const merge = useCustomersMerge();

  return (
    <ContactMerge kind="customer" fields={fields} title={customerTitle} merge={merge} {...props} />
  );
};

export const CompaniesMerge = (props: MergeProps<Company>) => {
  const fields = useCompanyFields();
  const merge = useCompaniesMerge();

  return (
    <ContactMerge kind="company" fields={fields} title={companyTitle} merge={merge} {...props} />
  );
};
