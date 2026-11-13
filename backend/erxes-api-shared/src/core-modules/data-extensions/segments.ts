import { SegmentField } from '../segments/fieldBuilders';
import { SegmentFieldMeta, SegmentFieldNamespace } from '../segments/fieldMeta';
import {
  DATA_EXTENSION_ADDRESS_PARTS,
  DATA_EXTENSIONS_NAMESPACE,
} from './constants';
import { IDataExtensionField } from './types';

/**
 * Segment fields of a record type's Data Extensions: their values sit in one
 * object on the record keyed by field key, so `dataExtensions.<key>` reads
 * and filters as the dotted path it is.
 */
export const dataExtensionSegmentNamespace = (
  recordType: string,
): SegmentFieldNamespace => ({
  prefix: DATA_EXTENSIONS_NAMESPACE,
  label: 'Data Extensions',
  path: DATA_EXTENSIONS_NAMESPACE,
  dataExtensionRecordType: recordType,
});

const PART_LABELS: Record<string, string> = {
  street: 'Street',
  street2: 'Street 2',
  city: 'City',
  state: 'State',
  postalCode: 'Postal code',
  country: 'Country',
  firstName: 'First name',
  lastName: 'Last name',
};

const parts = (
  base: { key: string; label: string },
  names: readonly string[],
): SegmentFieldMeta[] =>
  names.map((name) =>
    SegmentField.text({
      key: `${base.key}.${name}`,
      label: `${base.label} / ${PART_LABELS[name] || name}`,
    }),
  );

/**
 * What a segment can compare on one field. Computed fields store nothing,
 * and relations, links, files and JSON have no value a condition can name.
 */
export const toDataExtensionSegmentFields = (
  field: Pick<
    IDataExtensionField,
    'key' | 'label' | 'type' | 'options' | 'relation' | 'settings'
  >,
): SegmentFieldMeta[] => {
  const key = `${DATA_EXTENSIONS_NAMESPACE}.${field.key}`;
  const group = field.settings?.group;
  const base = {
    key,
    label: group ? `${group} / ${field.label}` : field.label,
  };

  switch (field.type) {
    case 'text':
    case 'longText':
    case 'email':
    case 'url':
    case 'phone':
    case 'emails':
    case 'phones':
      return [SegmentField.text(base)];
    case 'number':
    case 'rating':
    case 'percent':
      return [SegmentField.number(base)];
    case 'currency':
      return [SegmentField.number({ key: `${key}.amount`, label: base.label })];
    case 'boolean':
      return [SegmentField.boolean(base)];
    case 'date':
    case 'dateTime':
      return [SegmentField.date(base)];
    case 'select':
    case 'multiSelect':
      return [
        SegmentField.static({
          ...base,
          options: (field.options || []).map(({ value, label }) => ({
            value,
            label,
          })),
        }),
      ];
    case 'member':
      return [
        SegmentField.lookup({
          ...base,
          query: { name: 'users', labelField: 'email' },
        }),
      ];
    case 'address':
      return parts(base, DATA_EXTENSION_ADDRESS_PARTS);
    case 'fullName':
      return parts(base, ['firstName', 'lastName']);
    default:
      return [];
  }
};
