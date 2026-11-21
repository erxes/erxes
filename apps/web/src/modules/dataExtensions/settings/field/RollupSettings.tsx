import type { DataExtensionFieldSettings } from '@erxes/core-contract';
import { Input } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useFields, useRecordType } from '../../dataQueries';
import { SelectRow, SettingRow } from '../SettingRow';

type Rollup = NonNullable<DataExtensionFieldSettings['rollup']>;

const OPS = {
  count: 'Count',
  countNotEmpty: 'Count with a value',
  sum: 'Sum',
  avg: 'Average',
  min: 'Smallest',
  max: 'Largest',
} satisfies Record<Rollup['op'], string>;

const isOp = (value: string): value is Rollup['op'] => Object.hasOwn(OPS, value);

/**
 * A rollup: over the records one of this type's relations links, a count or a sum (average,
 * smallest, largest) of one of their fields, only those `where` holds for.
 */
export const RollupSettings = ({
  recordType,
  rollup,
  onChange,
}: {
  recordType: string;
  rollup: Partial<Rollup>;
  onChange: (rollup: Partial<Rollup>) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'rollup' });
  const whereId = useId();
  const relations = useFields(recordType).fields.filter((field) => field.type === 'relation');
  const relation = relations.find((field) => field.key === rollup.relation);
  const target = relation?.relation?.targetRecordType ?? null;
  const targetFields = useFields(target).fields;
  const native = useRecordType(target)?.nativeFields ?? [];
  const counting = rollup.op === undefined || rollup.op === 'count';

  return (
    <div className="flex flex-col gap-3">
      <SelectRow
        label={t('relation', 'Records of')}
        value={rollup.relation ?? ''}
        options={relations.map((field) => ({ value: field.key, label: field.label }))}
        onChange={(key) => onChange({ ...rollup, relation: key, field: undefined })}
      />
      <SelectRow
        label={t('op', 'Work out')}
        value={rollup.op ?? 'count'}
        options={Object.entries(OPS).map(([op, label]) => ({
          value: op,
          label: t(`ops.${op}`, label),
        }))}
        onChange={(op) => isOp(op) && onChange({ ...rollup, op })}
      />
      {!counting && (
        <SelectRow
          label={t('field', 'Of their field')}
          value={rollup.field ?? ''}
          options={[...targetFields, ...native].map((field) => ({
            value: field.key,
            label: field.label,
          }))}
          onChange={(field) => onChange({ ...rollup, field })}
        />
      )}
      <SettingRow
        label={t('where', 'Only where')}
        htmlFor={whereId}
        hint={t(
          'where-hint',
          'A formula over the linked records, such as NOT {paid}. Empty: all of them.',
        )}
      >
        <Input
          id={whereId}
          value={rollup.where ?? ''}
          onChange={({ target: input }) => onChange({ ...rollup, where: input.value || undefined })}
        />
      </SettingRow>
      {!relations.length && (
        <p className="text-xs text-muted-foreground">
          {t(
            'no-relations',
            'Add a relation to this record type first: a rollup sums up the records it links.',
          )}
        </p>
      )}
    </div>
  );
};
