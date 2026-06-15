import { useState } from 'react';
import { Button, useToast } from 'erxes-ui';
import {
  IconHistory,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import { ILogDoc } from '../types';
import { LogDetailSection } from './LogDetailPrimitives';
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

/**
 * "Revert this action" surface for a Mongo data-change log. Previews the
 * point-in-time revert of the whole processId (dry run), then applies it —
 * offering a field-level merge choice when a record changed in the interim.
 */
export const LogRevertPanel = ({ detail }: { detail: ILogDoc }) => {
  const { processId, source } = detail;
  const { preview, apply, loading } = useRevertProcess();
  const { toast } = useToast();

  const [result, setResult] = useState<IRevertResult | null>(null);
  // docKey -> field -> chosen mode
  const [choices, setChoices] = useState<
    Record<string, Record<string, 'restore' | 'keep'>>
  >({});
  const [done, setDone] = useState(false);

  // Only Mongo data changes carry a revertable processId.
  if (source !== 'mongo' || !processId) {
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

  return (
    <LogDetailSection
      title="Revert"
      description="Undo every change made in this action (point-in-time)."
      icon={IconHistory}
    >
      {!result && (
        <Button onClick={onPreview} disabled={loading} variant="secondary">
          {loading ? 'Checking…' : 'Revert this action'}
        </Button>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          {result.alreadyReverted && (
            <p className="text-sm text-muted-foreground">
              This action was already reverted.
            </p>
          )}

          {result.reverted.length > 0 && (
            <div className="text-sm">
              <span className="font-semibold">
                {done ? 'Restored' : 'Will restore'}:
              </span>
              <ul className="mt-1 list-disc pl-5">
                {result.reverted.map((it, i) => (
                  <li key={i} className="font-mono text-xs">
                    {it.kind} · {it.contentType} · {it.docId}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.unrevertable.length > 0 && (
            <div className="text-sm text-amber-600">
              <span className="font-semibold">Cannot revert:</span>
              <ul className="mt-1 list-disc pl-5">
                {result.unrevertable.map((it, i) => (
                  <li key={i} className="text-xs">
                    {it.action} — {it.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.conflicts.length > 0 && !done && (
            <div className="rounded-lg border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
                <IconAlertTriangle size={16} /> Conflicts — choose what to keep
              </div>
              {result.conflicts.map((c) => (
                <div key={keyOf(c)} className="mb-3">
                  <p className="font-mono text-xs text-muted-foreground">
                    {c.contentType} · {c.docId}
                  </p>
                  {c.fields.map((f) => {
                    const mode = choices[keyOf(c)]?.[f.field] || 'restore';
                    return (
                      <div
                        key={f.field}
                        className="mt-1 flex flex-wrap items-center gap-2 text-xs"
                      >
                        <span className="font-semibold">{f.field}</span>
                        <Button
                          variant={mode === 'keep' ? 'default' : 'outline'}
                          onClick={() => setChoice(keyOf(c), f.field, 'keep')}
                        >
                          Keep current: {valueText(f.currentValue)}
                        </Button>
                        <Button
                          variant={mode === 'restore' ? 'default' : 'outline'}
                          onClick={() => setChoice(keyOf(c), f.field, 'restore')}
                        >
                          Restore: {valueText(f.revertValue)}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ))}
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

          {done && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <IconCheck size={16} /> Reverted successfully.
            </div>
          )}
        </div>
      )}
    </LogDetailSection>
  );
};
