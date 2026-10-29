import { Badge, Input, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useDataExtensionRecordTypes } from '../hooks/useDataExtensionRecordTypes';
import {
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionLinkedRecord,
  isListRelation,
} from '../types';
import { LINKED_RECORDS_PAGE } from '../utils/typedOperations';
import {
  canPickRecordType,
  DataExtensionRecordPicker,
} from './DataExtensionRecordPicker';

const LinkedRecords = ({
  records,
  emptyLabel,
}: {
  records: IDataExtensionLinkedRecord[];
  emptyLabel: string;
}) =>
  records.length ? (
    <ul className="flex flex-wrap gap-1.5">
      {records.map((record) => (
        <li key={record._id}>
          <Badge variant="secondary" title={record._id}>
            {record.name}
          </Badge>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-xs text-muted-foreground">{emptyLabel}</p>
  );

/**
 * Edits a relation from either side: the link a record stores, or the
 * records that link to it (saved by the server onto those records). Records
 * are picked by name; ids can still be typed when the other record type's
 * module is disabled. A has-many list too long to load whole is shown
 * read-only.
 */
export const DataExtensionRelationValue = ({
  field,
  id,
  value,
  links,
  editable,
  onChange,
}: {
  field: IDataExtensionField;
  id: string;
  value: DataExtensionValue;
  links: IDataExtensionLinkedRecord[];
  editable: boolean;
  onChange: (value: DataExtensionValue) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { recordTypes } = useDataExtensionRecordTypes();
  const relation = field.relation;

  if (!relation) {
    return null;
  }

  if (!editable) {
    const other = recordTypes.find(
      (candidate) => candidate.recordType === relation.targetRecordType,
    );

    return (
      <div id={id} className="flex flex-col gap-1.5">
        <LinkedRecords records={links} emptyLabel={t('values.no-links-here')} />
        <p className="text-xs text-muted-foreground">
          {t('values.too-many-links', {
            count: LINKED_RECORDS_PAGE,
            label: other
              ? t(`record-types.${other.recordType}`, other.label)
              : relation.targetRecordType,
          })}
        </p>
      </div>
    );
  }

  if (canPickRecordType(relation.targetRecordType, recordTypes)) {
    const list = isListRelation(relation);

    return (
      <DataExtensionRecordPicker
        id={id}
        recordType={relation.targetRecordType}
        known={links}
        mode={list ? 'multiple' : 'single'}
        value={
          list
            ? Array.isArray(value)
              ? (value as unknown[]).filter(
                  (id): id is string => typeof id === 'string',
                )
              : []
            : typeof value === 'string'
            ? value
            : undefined
        }
        onChange={(next) => {
          const ids = (Array.isArray(next) ? next : next ? [next] : []).filter(
            Boolean,
          );

          onChange(list ? (ids.length ? ids : null) : ids[0] || null);
        }}
      />
    );
  }

  if (isListRelation(relation)) {
    const ids = Array.isArray(value) ? value : [];

    return (
      <div className="flex flex-col gap-2">
        <Textarea
          id={id}
          rows={3}
          className="font-mono text-xs"
          placeholder={t('values.ids-placeholder')}
          value={ids.join('\n')}
          onChange={(event) => {
            const next = event.target.value
              .split(/[\s,]+/)
              .map((item) => item.trim())
              .filter(Boolean);
            onChange(next.length ? next : null);
          }}
        />
        <LinkedRecords records={links} emptyLabel={t('values.no-links')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        id={id}
        className="font-mono text-xs"
        placeholder={t('values.id-placeholder')}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value.trim() || null)}
      />
      <LinkedRecords records={links} emptyLabel={t('values.no-links')} />
    </div>
  );
};
