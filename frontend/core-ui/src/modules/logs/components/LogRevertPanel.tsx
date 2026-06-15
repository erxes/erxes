import { useState } from 'react';
import { Badge, Button, cn, useToast } from 'erxes-ui';
import {
  IconHistory,
  IconAlertTriangle,
  IconCircleCheck,
  IconArrowBackUp,
} from '@tabler/icons-react';
import { ILogDoc } from '../types';
import {
  useRevertProcess,
  IRevertResult,
  IDocResolution,
} from '@/logs/hooks/useRevertProcess';

const keyOf = (c: { contentType: string; docId: string }) =>
  `${c.contentType}::${c.docId}`;

const valueText = (v: unknown): string => {
  if (v === undefined || v === null) return '—';
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const entityLabel = (contentType?: string) => {
  if (!contentType) return 'record';
  const seg = contentType.split(':')[1] || contentType;
  return seg.split('.').pop() || contentType;
};

/** One selectable value card in the conflict chooser. */
const OptionCard = ({
  selected,
  onClick,
  label,
  value,
  tone,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  value: string;
  tone: 'current' | 'previous';
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      'flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors min-w-0',
      selected
        ? 'border-primary bg-primary/5 ring-1 ring-primary'
        : 'border-border bg-background hover:bg-accent',
    )}
  >
    <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {selected ? (
        <IconCircleCheck size={13} className="text-primary" />
      ) : (
        <span
          className={cn(
            'inline-block size-3 rounded-full border',
            tone === 'previous' ? 'border-primary/40' : 'border-border',
          )}
        />
      )}
      {label}
    </span>
    <span
      className="w-full truncate font-mono text-sm text-foreground"
      title={value}
    >
      {value}
    </span>
  </button>
);

/**
 * "Revert this action" surface for a Mongo data-change log. Self-contained:
 * renders nothing (no wrapper) for non-revertable logs. Previews the
 * point-in-time revert of the whole processId, then applies it — offering a
 * field-level merge choice when a record changed in the interim.
 */
export const LogRevertPanel = ({ detail }: { detail: ILogDoc }) => {
  const { processId, source, action } = detail;
  const { preview, apply, loading } = useRevertProcess();
  const { toast } = useToast();

  const [result, setResult] = useState<IRevertResult | null>(null);
  const [choices, setChoices] = useState<
    Record<string, Record<string, 'restore' | 'keep'>>
  >({});
  const [done, setDone] = useState(false);

  // Revertable from the Mongo data-change log OR the GraphQL mutation log of the
  // same request (both share the processId). Skip non-mutation/no-process logs,
  // and the revert mutation itself (reverting a revert would be a confusing redo).
  const isRevertMutation = detail.payload?.mutationName === 'logsRevertProcess';
  const revertable =
    !!processId &&
    !isRevertMutation &&
    (source === 'mongo' || (source === 'graphql' && action === 'mutation'));

  if (!revertable) {
    return null;
  }

  const showError = (e: unknown) =>
    toast({
      title: 'Revert failed',
      description: (e as Error)?.message || 'Unknown error',
      variant: 'destructive',
    });

  const onPreview = async () => {
    try {
      const r = await preview(processId);
      setResult(r);
      const next: Record<string, Record<string, 'restore' | 'keep'>> = {};
      for (const c of r.conflicts) {
        next[keyOf(c)] = {};
        for (const f of c.fields) next[keyOf(c)][f.field] = 'restore';
      }
      setChoices(next);
    } catch (e) {
      showError(e);
    }
  };

  const buildResolutions = (r: IRevertResult): IDocResolution[] =>
    r.conflicts.map((c) => ({
      contentType: c.contentType,
      docId: c.docId,
      fields: c.fields.map((f) => ({
        field: f.field,
        mode: choices[keyOf(c)]?.[f.field] || 'restore',
      })),
    }));

  const onApply = async () => {
    if (!result) return;
    try {
      const r = await apply(
        processId,
        result.conflicts.length ? buildResolutions(result) : undefined,
      );
      setResult(r);
      if (r.conflicts.length) {
        toast({
          title: 'Some changes still conflict',
          description: 'Resolve the remaining fields and apply again.',
          variant: 'destructive',
        });
      } else {
        setDone(true);
        toast({
          title: 'Reverted',
          description: `${r.reverted.length} change(s) undone.`,
          variant: 'success',
        });
      }
    } catch (e) {
      showError(e);
    }
  };

  const setChoice = (k: string, field: string, mode: 'restore' | 'keep') =>
    setChoices((prev) => ({ ...prev, [k]: { ...prev[k], [field]: mode } }));

  const setAll = (mode: 'restore' | 'keep') => {
    if (!result) return;
    const next: Record<string, Record<string, 'restore' | 'keep'>> = {};
    for (const c of result.conflicts) {
      next[keyOf(c)] = {};
      for (const f of c.fields) next[keyOf(c)][f.field] = mode;
    }
    setChoices(next);
  };

  const conflictFieldCount =
    result?.conflicts.reduce((n, c) => n + c.fields.length, 0) || 0;

  return (
    <section className="rounded-3xl border bg-background">
      <div className="flex items-start gap-3 border-b px-6 py-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <IconHistory size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Revert</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Undo every change made in this action, point-in-time.
          </p>
        </div>
      </div>

      <div className="px-6 py-5">
        {!result && (
          <Button onClick={onPreview} disabled={loading} variant="secondary">
            <IconArrowBackUp />
            {loading ? 'Checking…' : 'Revert this action'}
          </Button>
        )}

        {result && (
          <div className="flex flex-col gap-4">
            {result.alreadyReverted && (
              <p className="text-sm text-muted-foreground">
                This action was already reverted.
              </p>
            )}

            {result.reverted.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  {done ? 'Restored' : 'Will restore'}
                </p>
                <div className="flex flex-col gap-1.5">
                  {result.reverted.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                    >
                      <Badge variant="secondary">{it.kind}</Badge>
                      <span className="font-medium text-foreground">
                        {entityLabel(it.contentType)}
                      </span>
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {it.docId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.unrevertable.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <IconAlertTriangle size={15} /> Cannot revert
                </p>
                <div className="flex flex-col gap-1.5">
                  {result.unrevertable.map((it, i) => (
                    <p
                      key={i}
                      className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
                    >
                      {it.reason}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {result.conflicts.length > 0 && !done && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
                    <IconAlertTriangle size={15} />
                    {conflictFieldCount} field
                    {conflictFieldCount === 1 ? '' : 's'} changed since — choose
                    what to keep
                  </p>
                  <div className="flex gap-1.5">
                    <Button variant="outline" onClick={() => setAll('restore')}>
                      Restore all
                    </Button>
                    <Button variant="outline" onClick={() => setAll('keep')}>
                      Keep all
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {result.conflicts.map((c) => (
                    <div
                      key={keyOf(c)}
                      className="rounded-lg border bg-background p-3"
                    >
                      <p className="mb-2 text-xs font-medium text-foreground">
                        {entityLabel(c.contentType)}{' '}
                        <span className="font-mono text-muted-foreground">
                          {c.docId}
                        </span>
                      </p>
                      <div className="flex flex-col gap-3">
                        {c.fields.map((f) => {
                          const mode = choices[keyOf(c)]?.[f.field] || 'restore';
                          return (
                            <div key={f.field}>
                              <p className="mb-1.5 text-xs font-semibold text-foreground">
                                {f.field}
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <OptionCard
                                  tone="current"
                                  selected={mode === 'keep'}
                                  onClick={() =>
                                    setChoice(keyOf(c), f.field, 'keep')
                                  }
                                  label="Keep current"
                                  value={valueText(f.currentValue)}
                                />
                                <OptionCard
                                  tone="previous"
                                  selected={mode === 'restore'}
                                  onClick={() =>
                                    setChoice(keyOf(c), f.field, 'restore')
                                  }
                                  label="Restore previous"
                                  value={valueText(f.revertValue)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {done && (
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Badge variant="success">
                  <IconCircleCheck size={14} /> Reverted successfully
                </Badge>
              </div>
            )}

            {!done &&
              !result.alreadyReverted &&
              (result.reverted.length > 0 || result.conflicts.length > 0) && (
                <div className="flex gap-2">
                  <Button onClick={onApply} disabled={loading}>
                    {loading
                      ? 'Applying…'
                      : result.conflicts.length
                        ? 'Apply & revert'
                        : 'Confirm revert'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setResult(null)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
          </div>
        )}
      </div>
    </section>
  );
};
