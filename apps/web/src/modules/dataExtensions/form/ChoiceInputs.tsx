import { holdsMany } from '@erxes/core-contract/dataExtensionValues';
import {
  contactSearchQueries,
  memberQueries,
  orpc,
  productSearchQueries,
} from '@erxes/core-contract/client';
import { skipToken, useQuery } from '@tanstack/react-query';
import {
  LookupPicker,
  MultipleSelector,
  Select,
  useContactOptions,
  useMemberOptions,
  useProductOptions,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { stringsOf, textOfValue, type ValueInputProps } from './inputProps';

const NONE = '__none';

export const SelectValueInput = ({ field, value, onChange, id, disabled }: ValueInputProps) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });

  return (
    <Select
      value={textOfValue(value) || NONE}
      disabled={disabled}
      onValueChange={(next) => onChange(next === NONE ? null : next)}
    >
      <Select.Trigger id={id} variant="bordered">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={NONE}>{field.settings.placeholder ?? t('none', 'None')}</Select.Item>
        {field.options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

export const MultiSelectValueInput = ({
  field,
  value,
  onChange,
  id,
  disabled,
}: ValueInputProps) => {
  const options = field.options.map((option) => ({ value: option.value, label: option.label }));
  const picked = stringsOf(value);

  return (
    <MultipleSelector
      id={id}
      disabled={disabled}
      options={options}
      value={options.filter((option) => picked.includes(option.value))}
      placeholder={field.settings.placeholder}
      hidePlaceholderWhenSelected
      onChange={(next) => onChange(next.map((option) => option.value))}
    />
  );
};

/** Ids a value holds: one, or a list of them. */
const idsOf = (value: ValueInputProps['value']) =>
  typeof value === 'string' ? [value] : stringsOf(value);

/** One id, or several when `many`; an empty pick clears it. */
const pickedValue = (ids: string[], many: boolean) => (many ? ids : (ids[0] ?? null));

export const MemberValueInput = ({ field, value, onChange, disabled }: ValueInputProps) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });
  const ids = idsOf(value);
  const many = Boolean(field.settings.multiple);
  const lookup = useMemberOptions(memberQueries, !disabled, ids);

  return (
    <LookupPicker
      lookup={lookup}
      value={ids}
      multiple={many}
      disabled={disabled}
      placeholder={field.settings.placeholder ?? t('pick-member', 'Pick a team member')}
      onValueChange={(next) => onChange(pickedValue(next, many))}
    />
  );
};

/** A custom object's records as options: the first 100, and the picked ones. */
const useCustomRecordOptions = (objectKey: string | null, picked: string[]) => {
  const first = useQuery(
    orpc.dataRecords.list.queryOptions({
      input: objectKey ? { objectKey, limit: 100 } : skipToken,
      staleTime: 30_000,
    }),
  );

  const byIds = useQuery(
    orpc.dataRecords.list.queryOptions({
      input:
        objectKey && picked.length ? { objectKey, ids: picked.join(','), limit: 100 } : skipToken,
      staleTime: 30_000,
    }),
  );

  const rows = [...(byIds.data?.data ?? []), ...(first.data?.data ?? [])];

  const options = new Map(
    rows.map((row) => [row.id, { value: row.id, label: row.label ?? row.id }]),
  );

  return {
    options: [...options.values()],
    loading: first.isPending && objectKey !== null,
    error: first.error ?? byIds.error,
  };
};

/** The options a relation picks from, by the record type it links to. */
const useRelationOptions = (target: string, picked: string[]) => {
  const [owner, type = ''] = target.split('.');

  const contactType =
    target === 'core.customer' ? 'customer' : target === 'core.company' ? 'company' : null;

  const contacts = useContactOptions(contactSearchQueries, contactType, picked);
  const products = useProductOptions(productSearchQueries, target === 'core.product', picked);
  const members = useMemberOptions(memberQueries, target === 'core.member', picked);
  const custom = useCustomRecordOptions(owner === 'custom' ? type : null, picked);

  if (contactType) return contacts;

  if (target === 'core.product') return products;

  if (target === 'core.member') return members;

  return owner === 'custom' ? custom : null;
};

/** Links to records of the relation's target type: one, or several on its "many" side. */
export const RelationValueInput = ({ field, value, onChange, disabled }: ValueInputProps) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });
  const ids = idsOf(value);
  const relation = field.relation;
  const lookup = useRelationOptions(relation?.targetRecordType ?? '', ids);
  const many = relation ? holdsMany(relation) : false;

  if (!lookup) {
    return <p className="text-sm text-muted-foreground">{ids.join(', ') || '—'}</p>;
  }

  return (
    <LookupPicker
      lookup={lookup}
      value={ids}
      multiple={many}
      disabled={disabled}
      placeholder={t('pick-record', 'Pick a record')}
      onValueChange={(next) => onChange(pickedValue(next, many))}
    />
  );
};
