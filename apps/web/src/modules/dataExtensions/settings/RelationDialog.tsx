import type { DataExtensionRelationKind } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Dialog, Input, Spinner } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { recordTypesQuery, useRefreshDataModel } from '../dataQueries';
import { FormError } from '../form/DraftEditor';
import { useDataErrorText } from '../useDataErrors';
import { keyOfLabel } from './field/fieldDraft';
import { SelectRow, SettingRow } from './SettingRow';

const KINDS = {
  manyToOne: 'Each links one; one is linked by many',
  oneToMany: 'Each links many; each of those links back to one',
  oneToOne: 'One to one',
  manyToMany: 'Many to many',
} satisfies Record<DataExtensionRelationKind, string>;

const isKind = (value: string): value is DataExtensionRelationKind => Object.hasOwn(KINDS, value);

interface RelationDraft {
  label: string;
  key: string;
  targetRecordType: string;
  kind: DataExtensionRelationKind;
  inverseLabel: string;
  inverseKey: string;
  onDelete: 'setNull' | 'cascade';
}

/** Label and key of one side, the key following the label as it is typed. */
const SideInputs = ({
  label,
  keyValue,
  onChange,
  title,
}: {
  label: string;
  keyValue: string;
  title: string;
  onChange: (label: string, key: string) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'relation' });
  const ids = { label: useId(), key: useId() };

  return (
    <div className="flex gap-3">
      <SettingRow label={title} htmlFor={ids.label}>
        <Input
          id={ids.label}
          value={label}
          onChange={({ target }) => onChange(target.value, keyOfLabel(target.value))}
        />
      </SettingRow>
      <SettingRow label={t('key', 'Key')} htmlFor={ids.key}>
        <Input
          id={ids.key}
          value={keyValue}
          onChange={({ target }) => onChange(label, target.value)}
        />
      </SettingRow>
    </div>
  );
};

const RelationForm = ({ recordType, onDone }: { recordType: string; onDone: () => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'relation' });
  const types = useQuery(recordTypesQuery()).data?.data ?? [];
  const refresh = useRefreshDataModel();
  const errorText = useDataErrorText();

  const relate = useMutation(
    orpc.dataFields.relate.mutationOptions({ onSuccess: () => void refresh().then(onDone) }),
  );

  const [draft, setDraft] = useState<RelationDraft>({
    label: '',
    key: '',
    targetRecordType: '',
    kind: 'manyToOne',
    inverseLabel: '',
    inverseKey: '',
    onDelete: 'setNull',
  });

  const set = (patch: Partial<RelationDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const custom = draft.targetRecordType.startsWith('custom.');

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        relate.mutate({ ...draft, recordType });
      }}
    >
      <FormError message={relate.error ? errorText(relate.error) : null} />
      <SelectRow
        label={t('target', 'Links to')}
        value={draft.targetRecordType}
        options={types.map((type) => ({ value: type.type, label: type.label }))}
        onChange={(targetRecordType) => set({ targetRecordType })}
      />
      <SelectRow
        label={t('kind', 'How many')}
        value={draft.kind}
        options={Object.entries(KINDS).map(([kind, text]) => ({
          value: kind,
          label: t(`kinds.${kind}`, text),
        }))}
        onChange={(kind) => isKind(kind) && set({ kind })}
      />
      <SideInputs
        title={t('label', 'Field here')}
        label={draft.label}
        keyValue={draft.key}
        onChange={(label, key) => set({ label, key })}
      />
      <SideInputs
        title={t('inverse-label', 'Field on the linked records')}
        label={draft.inverseLabel}
        keyValue={draft.inverseKey}
        onChange={(inverseLabel, inverseKey) => set({ inverseLabel, inverseKey })}
      />
      {custom && (
        <SelectRow
          label={t('on-delete', 'When a linked record is deleted for good')}
          value={draft.onDelete}
          options={[
            { value: 'setNull', label: t('set-null', 'Clear the link') },
            { value: 'cascade', label: t('cascade', 'Delete this record too') },
          ]}
          onChange={(onDelete) =>
            (onDelete === 'cascade' || onDelete === 'setNull') && set({ onDelete })
          }
        />
      )}
      <Button
        type="submit"
        disabled={relate.isPending || !draft.targetRecordType || !draft.key || !draft.inverseKey}
      >
        {relate.isPending && <Spinner size="sm" />}
        {t('create', 'Add relation')}
      </Button>
    </form>
  );
};

/** Links two record types: a field on each side, made together. */
export const RelationDialog = ({
  recordType,
  open,
  onOpenChange,
}: {
  recordType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'relation' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('title', 'Add relation')}
          description={t(
            'description',
            'A relation adds a field here and its pair on the record type it links to.',
          )}
        />
        {open && <RelationForm recordType={recordType} onDone={() => onOpenChange(false)} />}
      </Dialog.Content>
    </Dialog>
  );
};
