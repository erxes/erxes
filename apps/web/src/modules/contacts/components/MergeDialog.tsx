import { IconArrowMerge } from '@tabler/icons-react';
import { Button, cn, Dialog, Spinner } from 'erxes-ui';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** A field whose value the merged record can take from any of the records. */
export interface MergeField<Row, Key extends keyof Row & string> {
  key: Key;
  label: string;
  /** How the value shows; as text when not given. */
  show?: (row: Row) => ReactNode;
  /** Whether the row has a value; any but null, empty text or an empty list when not given. */
  isSet?: (row: Row) => boolean;
}

interface MergeRow {
  id: string;
}

type Picks<Key extends string> = Partial<Record<Key, string>>;

const filled = (value: unknown) =>
  value !== null &&
  value !== undefined &&
  value !== '' &&
  !(Array.isArray(value) && value.length === 0);

const hasValue = <Row, Key extends keyof Row & string>(field: MergeField<Row, Key>, row: Row) =>
  field.isSet ? field.isSet(row) : filled(row[field.key]);

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const CHOICE =
  'min-w-0 flex-1 basis-0 cursor-pointer rounded-md border border-transparent transition-colors hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring';

const CHOSEN = 'border-primary bg-primary/5 hover:bg-primary/10';

/**
 * The record kept and where each field's value comes from: the record picked
 * for it, or else the kept record, or else the first other record with a value
 * (as core fills it). Each opening starts with the first record kept.
 */
const useMergeChoices = <Row extends MergeRow, Key extends keyof Row & string>(
  open: boolean,
  records: Row[],
  fields: MergeField<Row, Key>[],
) => {
  const [keepId, setKeepId] = useState('');
  const [picks, setPicks] = useState<Picks<Key>>({});
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setKeepId('');
      setPicks({});
    }
  }

  const keep = records.find((record) => record.id === keepId) ?? records[0];
  const ordered = keep ? [keep, ...records.filter((record) => record !== keep)] : records;
  const shown = fields.filter((field) => records.some((record) => hasValue(field, record)));

  const sourceOf = (field: MergeField<Row, Key>) =>
    ordered.find((row) => row.id === picks[field.key] && hasValue(field, row)) ??
    ordered.find((row) => hasValue(field, row));

  const chosen = () => {
    const sources: Picks<Key> = {};

    for (const field of shown) {
      const source = sourceOf(field);

      if (source) sources[field.key] = source.id;
    }

    return sources;
  };

  return {
    keep,
    shown,
    sourceOf,
    chosen,
    /** Keeping another record starts every field from it again. */
    keepRecord: (id: string) => {
      setKeepId(id);
      setPicks({});
    },
    pick: (key: Key, id: string) => setPicks((current) => ({ ...current, [key]: id })),
  };
};

/** One field's values side by side; the chosen one is highlighted. */
const FieldChoices = <Row extends MergeRow, Key extends keyof Row & string>({
  name,
  field,
  records,
  source,
  onPick,
}: {
  name: string;
  field: MergeField<Row, Key>;
  records: Row[];
  source: Row | undefined;
  onPick: (id: string) => void;
}) => (
  <fieldset className="flex items-center gap-2 border-t py-1">
    <legend className="sr-only">{field.label}</legend>
    <span aria-hidden className="w-28 shrink-0 truncate text-xs text-muted-foreground">
      {field.label}
    </span>
    {records.map((record) =>
      hasValue(field, record) ? (
        <label
          key={record.id}
          className={cn(
            CHOICE,
            'flex min-h-8 items-center px-2 py-1 text-sm',
            source && sameValue(record[field.key], source[field.key]) && CHOSEN,
          )}
        >
          <input
            type="radio"
            name={name}
            value={record.id}
            checked={record.id === source?.id}
            onChange={() => onPick(record.id)}
            className="sr-only"
          />
          <span className="min-w-0 truncate">
            {field.show ? field.show(record) : String(record[field.key])}
          </span>
        </label>
      ) : (
        <span key={record.id} className="min-w-0 flex-1 basis-0 px-2 text-sm text-muted-foreground">
          —
        </span>
      ),
    )}
  </fieldset>
);

/** The records as column heads; the chosen one is kept. */
const KeepChoices = <Row extends MergeRow>({
  name,
  legend,
  records,
  keepId,
  head,
  onKeep,
}: {
  name: string;
  legend: string;
  records: Row[];
  keepId: string;
  head: (row: Row) => { title: string; details: string[] };
  onKeep: (id: string) => void;
}) => {
  const { t } = useTranslation('contact');

  return (
    <fieldset className="flex gap-2 pb-1">
      <legend className="sr-only">{legend}</legend>
      <span className="w-28 shrink-0" />
      {records.map((record) => {
        const { title, details } = head(record);

        return (
          <label
            key={record.id}
            className={cn(
              CHOICE,
              'flex flex-col items-start gap-0.5 rounded-lg border-border px-3 py-2 text-left',
              record.id === keepId && CHOSEN,
            )}
          >
            <input
              type="radio"
              name={name}
              value={record.id}
              checked={record.id === keepId}
              onChange={() => onKeep(record.id)}
              className="sr-only"
            />
            <span className="flex w-full items-center justify-between gap-2 text-sm font-medium">
              <span className="truncate">{title}</span>
              {record.id === keepId && (
                <span className="text-xs text-primary-text">{t('merge.keep', 'Keep')}</span>
              )}
            </span>
            {details.filter(Boolean).map((detail) => (
              <span key={detail} className="w-full truncate text-xs text-muted-foreground">
                {detail}
              </span>
            ))}
          </label>
        );
      })}
    </fieldset>
  );
};

/**
 * Pick the record to keep and, field by field, the value it takes; the others
 * are merged into it. Emails, phones, tags and links are combined.
 */
export const MergeDialog = <Row extends MergeRow, Key extends keyof Row & string>({
  open,
  onOpenChange,
  kind,
  records,
  head,
  fields,
  merging,
  picker,
  onMerge,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What is merged, which the dialog's words name. */
  kind: 'customer' | 'company';
  records: Row[];
  /** A record's column head: its name and what tells it apart. */
  head: (row: Row) => { title: string; details: string[] };
  fields: MergeField<Row, Key>[];
  merging?: boolean;
  /** Above the records: how a record's own page picks the one to merge with. */
  picker?: ReactNode;
  onMerge: (keepId: string, fields: Picks<Key>) => void;
}) => {
  const { t } = useTranslation('contact');
  const name = useId();
  const choices = useMergeChoices(open, records, fields);
  const { keep } = choices;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>
            {t(`merge.title.${kind}`, { total: Math.max(records.length, 2) })}
          </Dialog.Title>
          <Dialog.Description>{t(`merge.description.${kind}`)}</Dialog.Description>
        </Dialog.Header>
        {picker}
        {records.length > 0 && (
          <div className="-mx-1 max-h-96 overflow-y-auto px-1">
            <KeepChoices
              name={`${name}-keep`}
              legend={t(`merge.legend.${kind}`)}
              records={records}
              keepId={keep?.id ?? ''}
              head={head}
              onKeep={choices.keepRecord}
            />
            {choices.shown.map((field) => (
              <FieldChoices
                key={field.key}
                name={`${name}-${field.key}`}
                field={field}
                records={records}
                source={choices.sourceOf(field)}
                onPick={(id) => choices.pick(field.key, id)}
              />
            ))}
          </div>
        )}
        <Dialog.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={merging}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            onClick={() => keep && onMerge(keep.id, choices.chosen())}
            disabled={!keep || records.length < 2 || merging}
          >
            {merging ? <Spinner size="sm" /> : <IconArrowMerge />}
            {t('merge.merge', 'Merge')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
