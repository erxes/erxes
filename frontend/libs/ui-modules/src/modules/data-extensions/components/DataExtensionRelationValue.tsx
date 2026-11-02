import { IconPencil, IconPlus } from '@tabler/icons-react';
import { Badge, badgeVariants, Button, cn, Input, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules/modules/widget/record-side-panel/useSidePanel';
import { useDataExtensionRecordTypes } from '../hooks/useDataExtensionRecordTypes';
import {
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionLinkedRecord,
  IDataExtensionRecordType,
  isListRelation,
} from '../types';
import { LINKED_RECORDS_PAGE } from '../utils/typedOperations';
import {
  canPickRecordType,
  DataExtensionRecordPicker,
} from './DataExtensionRecordPicker';

/**
 * The content type the record side panel opens a linked record as, or none
 * when it has no single one: team members have their own screens, and
 * vendors and clients may be a company or a customer.
 */
export const sidePanelContentTypeOf = (
  recordType: string,
  recordTypes: IDataExtensionRecordType[],
) => {
  const descriptor = recordTypes.find(
    (candidate) => candidate.recordType === recordType,
  );

  if (
    !descriptor ||
    recordType === 'core:teamMember' ||
    descriptor.contentTypes.length !== 1
  ) {
    return null;
  }

  return descriptor.contentTypes[0];
};

/** Linked records; each opens in the side panel when it has a view there. */
const LinkedRecords = ({
  records,
  emptyLabel,
  recordType,
}: {
  records: IDataExtensionLinkedRecord[];
  emptyLabel?: string;
  recordType: string;
}) => {
  const { recordTypes } = useDataExtensionRecordTypes();
  const { open, openRecord } = useSidePanel();
  const contentType = sidePanelContentTypeOf(recordType, recordTypes);

  if (!records.length) {
    return emptyLabel ? (
      <p className="text-xs text-muted-foreground">{emptyLabel}</p>
    ) : null;
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {records.map((record) => (
        <li key={record._id}>
          {contentType ? (
            <button
              type="button"
              title={record.name}
              className={cn(
                badgeVariants({ variant: 'secondary' }),
                'cursor-pointer hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              onClick={() =>
                // From inside the panel it stacks, so Back returns here.
                openRecord(
                  { contentType, contentId: record._id },
                  { stack: open },
                )
              }
            >
              {record.name}
            </button>
          ) : (
            <Badge variant="secondary" title={record._id}>
              {record.name}
            </Badge>
          )}
        </li>
      ))}
    </ul>
  );
};

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
        <LinkedRecords
          records={links}
          emptyLabel={t('values.no-links-here')}
          recordType={relation.targetRecordType}
        />
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
    const ids = list
      ? Array.isArray(value)
        ? (value as unknown[]).filter(
            (id): id is string => typeof id === 'string',
          )
        : []
      : typeof value === 'string'
      ? [value]
      : [];
    // Names of the links still in the draft; a link just picked shows once
    // the save returns its name.
    const shown = links.filter((link) => ids.includes(link._id));

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <LinkedRecords records={shown} recordType={relation.targetRecordType} />
        <DataExtensionRecordPicker
          id={id}
          recordType={relation.targetRecordType}
          known={links}
          mode={list ? 'multiple' : 'single'}
          trigger={
            ids.length ? (
              <Button
                id={id}
                variant="ghost"
                size="icon"
                className="size-6"
                aria-label={t('values.change-links')}
                title={t('values.change-links')}
              >
                <IconPencil />
              </Button>
            ) : (
              <Button id={id} variant="ghost" size="sm" className="h-6 px-1.5">
                <IconPlus />
                {t('values.add-link')}
              </Button>
            )
          }
          value={list ? ids : ids[0]}
          onChange={(next) => {
            const picked = (
              Array.isArray(next) ? next : next ? [next] : []
            ).filter(Boolean);

            onChange(
              list ? (picked.length ? picked : null) : picked[0] || null,
            );
          }}
        />
      </div>
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
        <LinkedRecords
          records={links}
          emptyLabel={t('values.no-links')}
          recordType={relation.targetRecordType}
        />
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
      <LinkedRecords
        records={links}
        emptyLabel={t('values.no-links')}
        recordType={relation.targetRecordType}
      />
    </div>
  );
};
