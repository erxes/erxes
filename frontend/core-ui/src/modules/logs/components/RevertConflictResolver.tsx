import { Badge, ToggleGroup, cn } from 'erxes-ui';
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
} from '@tabler/icons-react';
import { IRevertConflict } from '@/logs/hooks/useRevertProcess';
import {
  conflictKey,
  entityNoun,
  formatValue,
  humanizeField,
  shortId,
} from '@/logs/utils/revertFormat';

type Mode = 'restore' | 'keep';

interface RevertConflictResolverProps {
  conflicts: IRevertConflict[];
  /** Per-record, per-field decision map keyed by `conflictKey`. */
  choices: Record<string, Record<string, Mode>>;
  onChoice: (key: string, field: string, mode: Mode) => void;
  onSetAll: (mode: Mode) => void;
}

/** One value side of the before → after comparison; lights up when it's the chosen outcome. */
const ValueChip = ({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) => (
  <div
    className={cn(
      'min-w-0 flex-1 rounded-lg border px-3 py-2 transition-colors',
      active
        ? 'border-primary bg-primary/5 ring-1 ring-primary/40'
        : 'border-border bg-muted/20 opacity-70',
    )}
  >
    <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {active && <IconCircleCheck className="size-3 text-primary" />}
      {label}
    </div>
    <div className="truncate text-sm text-foreground" title={value}>
      {value}
    </div>
  </div>
);

/** A single changed field: pick the version, see the resulting value highlighted. */
const FieldRow = ({
  field,
  mode,
  onChange,
}: {
  field: IRevertConflict['fields'][number];
  mode: Mode;
  onChange: (mode: Mode) => void;
}) => {
  const previous = formatValue(field.revertValue);
  const current = formatValue(field.currentValue);

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">
          {humanizeField(field.field)}
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={mode}
          onValueChange={(v) => v && onChange(v as Mode)}
        >
          <ToggleGroup.Item value="restore">Restore previous</ToggleGroup.Item>
          <ToggleGroup.Item value="keep">Keep current</ToggleGroup.Item>
        </ToggleGroup>
      </div>
      <div className="flex items-stretch gap-2">
        <ValueChip
          label="Previous"
          value={previous}
          active={mode === 'restore'}
        />
        <div className="flex shrink-0 items-center text-muted-foreground">
          <IconArrowRight className="size-4" />
        </div>
        <ValueChip label="Current" value={current} active={mode === 'keep'} />
      </div>
    </div>
  );
};

/** One conflicting record and all of its changed fields. */
const RecordBlock = ({
  conflict,
  choices,
  onChoice,
  showHeader,
}: {
  conflict: IRevertConflict;
  choices: Record<string, Mode>;
  onChoice: (field: string, mode: Mode) => void;
  showHeader: boolean;
}) => (
  <div className="px-4 py-3">
    {showHeader && (
      <div className="mb-2 flex items-center gap-1.5">
        <Badge variant="secondary">{entityNoun(conflict.contentType)}</Badge>
        <span
          className="truncate font-mono text-xs text-muted-foreground"
          title={conflict.docId}
        >
          {shortId(conflict.docId)}
        </span>
      </div>
    )}
    <div className="flex flex-col divide-y">
      {conflict.fields.map((f) => (
        <FieldRow
          key={f.field}
          field={f}
          mode={choices[f.field] || 'restore'}
          onChange={(mode) => onChoice(f.field, mode)}
        />
      ))}
    </div>
  </div>
);

/**
 * Plain-language merge UI shown when a record was edited after the action being
 * undone. For each changed detail the user picks "Restore previous" or "Keep
 * current"; the comparison highlights the value the record will end up with, so
 * the outcome is visible before applying. A single segmented control up top sets
 * every field at once.
 */
export const RevertConflictResolver = ({
  conflicts,
  choices,
  onChoice,
  onSetAll,
}: RevertConflictResolverProps) => {
  const fieldCount = conflicts.reduce((n, c) => n + c.fields.length, 0);
  const modes = conflicts.flatMap((c) =>
    c.fields.map((f) => choices[conflictKey(c)]?.[f.field] ?? 'restore'),
  );
  const bulk: Mode | '' =
    modes.length && modes.every((m) => m === 'restore')
      ? 'restore'
      : modes.length && modes.every((m) => m === 'keep')
        ? 'keep'
        : '';
  const multi = conflicts.length > 1;

  return (
    <div className="overflow-hidden rounded-xl border border-warning/40 bg-background">
      <div className="flex items-start gap-3 bg-warning/5 px-4 py-3">
        <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {multi
              ? 'These records changed after your action'
              : 'This record changed after your action'}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {fieldCount} detail{fieldCount === 1 ? ' was' : 's were'} edited in
            the meantime. Choose which version to keep — the highlighted side is
            what you’ll end up with.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-y bg-muted/30 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Apply to everything
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={bulk}
          onValueChange={(v) => v && onSetAll(v as Mode)}
        >
          <ToggleGroup.Item value="restore" className="gap-1.5">
            <IconArrowBackUp className="size-3.5" />
            Restore all
          </ToggleGroup.Item>
          <ToggleGroup.Item value="keep" className="gap-1.5">
            <IconCheck className="size-3.5" />
            Keep all
          </ToggleGroup.Item>
        </ToggleGroup>
      </div>

      <div className="divide-y">
        {conflicts.map((c) => {
          const key = conflictKey(c);
          return (
            <RecordBlock
              key={key}
              conflict={c}
              choices={choices[key] || {}}
              onChoice={(field, mode) => onChoice(key, field, mode)}
              showHeader={multi}
            />
          );
        })}
      </div>
    </div>
  );
};
