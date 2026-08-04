import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Spinner, useToast } from 'erxes-ui';
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
import { RevertConflictResolver } from './RevertConflictResolver';
import {
  conflictKey,
  entityNoun,
  kindInfo,
  shortId,
} from '@/logs/utils/revertFormat';

/**
 * "Undo this change" surface for a data-change log. Self-contained: renders
 * nothing for non-revertable logs. On open it quietly checks whether the change
 * was already undone (so it can say so straight away); otherwise it offers a
 * one-click undo, previewing what will change and asking which version to keep
 * when a record was edited in the meantime.
 */
// skipcq: JS-R1005 — a single self-contained surface with several mutually
// exclusive display states (checking / already-undone / entry / preview /
// conflict / done); the branching is presentational, not tangled logic.
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
  // and the undo itself (undoing an undo would be a confusing redo).
  const isRevertMutation = detail.payload?.mutationName === 'logsRevertProcess';
  const revertable =
    Boolean(processId) &&
    !isRevertMutation &&
    (source === 'mongo' || (source === 'graphql' && action === 'mutation'));

  // Quietly check on open whether this was already undone, so we can show that
  // immediately instead of making the user click "Undo" only to find out.
  const [checking, setChecking] = useState(revertable);
  const [alreadyUndone, setAlreadyUndone] = useState(false);
  const prefetched = useRef<IRevertResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (revertable) {
      setChecking(true);
      (async () => {
        try {
          const res = await preview(processId);
          if (!cancelled) {
            prefetched.current = res;
            if (res.alreadyReverted) setAlreadyUndone(true);
          }
        } catch {
          // Couldn't pre-check — fall back to the manual button.
        } finally {
          if (!cancelled) setChecking(false);
        }
      })();
    } else {
      setChecking(false);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processId, revertable]);

  if (!revertable) {
    return null;
  }

  /** Toast a friendly, non-technical failure message. */
  const showError = (e: unknown) =>
    toast({
      title: "Couldn't undo",
      description: (e as Error)?.message || 'Something went wrong.',
      variant: 'destructive',
    });

  /** Seed every conflicted field's choice to "restore previous" by default. */
  const buildChoices = (r: IRevertResult) => {
    const next: Record<string, Record<string, 'restore' | 'keep'>> = {};
    for (const c of r.conflicts) {
      next[conflictKey(c)] = {};
      for (const f of c.fields) next[conflictKey(c)][f.field] = 'restore';
    }
    setChoices(next);
  };

  /** Dry-run the undo (reusing the silent pre-check) and show the preview. */
  const onPreview = async () => {
    try {
      // Reuse the silent pre-check if we already have it.
      const res = prefetched.current ?? (await preview(processId));
      prefetched.current = null;
      setResult(res);
      buildChoices(res);
    } catch (e) {
      showError(e);
    }
  };

  /** Turn the user's per-field choices into the mutation's resolution payload. */
  const buildResolutions = (r: IRevertResult): IDocResolution[] =>
    r.conflicts.map((c) => ({
      contentType: c.contentType,
      docId: c.docId,
      fields: c.fields.map((f) => ({
        field: f.field,
        mode: choices[conflictKey(c)]?.[f.field] || 'restore',
      })),
    }));

  /** Apply the undo (with merge choices when there are conflicts). */
  const onApply = async () => {
    if (!result) return;
    try {
      const res = await apply(
        processId,
        result.conflicts.length ? buildResolutions(result) : undefined,
      );
      setResult(res);
      if (res.conflicts.length) {
        toast({
          title: 'One more choice needed',
          description:
            'Pick a version for the highlighted items, then undo again.',
          variant: 'destructive',
        });
      } else {
        setDone(true);
        toast({
          title: 'Done',
          description: `${res.reverted.length} thing${
            res.reverted.length === 1 ? '' : 's'
          } put back.`,
          variant: 'success',
        });
      }
    } catch (e) {
      showError(e);
    }
  };

  /** Update one field's keep/restore choice for one conflicted record. */
  const setChoice = (k: string, field: string, mode: 'restore' | 'keep') =>
    setChoices((prev) => ({ ...prev, [k]: { ...prev[k], [field]: mode } }));

  /** Apply one keep/restore choice to every conflicted field at once. */
  const setAll = (mode: 'restore' | 'keep') => {
    if (!result) return;
    const next: Record<string, Record<string, 'restore' | 'keep'>> = {};
    for (const c of result.conflicts) {
      next[conflictKey(c)] = {};
      for (const f of c.fields) next[conflictKey(c)][f.field] = mode;
    }
    setChoices(next);
  };

  return (
    <section className="rounded-3xl border bg-background">
      <div className="flex items-start gap-3 border-b px-6 py-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <IconHistory size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            Undo this change
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Put everything back the way it was right before this happened.
          </p>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Quiet pre-check on open */}
        {checking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" />
            Checking if this can be undone…
          </div>
        )}

        {/* Already undone — say so straight away, no buttons needed */}
        {!checking && alreadyUndone && !done && (
          <div className="flex items-start gap-3 rounded-xl bg-muted/40 px-4 py-3">
            <IconCircleCheck
              size={20}
              className="mt-0.5 shrink-0 text-success"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                Already undone
              </p>
              <p className="text-sm text-muted-foreground">
                This change was reverted earlier — there’s nothing left to undo.
              </p>
            </div>
          </div>
        )}

        {/* Entry button */}
        {!checking && !alreadyUndone && !result && (
          <Button onClick={onPreview} disabled={loading} variant="secondary">
            <IconArrowBackUp />
            {loading ? 'Working…' : 'Undo this change'}
          </Button>
        )}

        {!checking && !alreadyUndone && result && (
          <div className="flex flex-col gap-4">
            {result.reverted.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  {done ? 'Here’s what was put back:' : 'This will put back:'}
                </p>
                <div className="flex flex-col gap-1.5">
                  {result.reverted.map((it) => {
                    const info = kindInfo(it.kind);
                    return (
                      <div
                        key={`${it.contentType}::${it.docId}::${it.kind}`}
                        className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                      >
                        <Badge variant={info.variant}>{info.label}</Badge>
                        <span className="font-medium text-foreground">
                          {entityNoun(it.contentType)}
                        </span>
                        {it.docId && (
                          <span
                            className="truncate font-mono text-xs text-muted-foreground"
                            title={it.docId}
                          >
                            {shortId(it.docId)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result.unrevertable.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <IconAlertTriangle size={15} /> These can’t be undone
                </p>
                <div className="flex flex-col gap-1.5">
                  {result.unrevertable.map((it) => (
                    <p
                      key={`${it.contentType ?? ''}::${it.docId ?? ''}::${
                        it.action
                      }`}
                      className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
                    >
                      {it.reason}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {result.conflicts.length > 0 && !done && (
              <RevertConflictResolver
                conflicts={result.conflicts}
                choices={choices}
                onChoice={setChoice}
                onSetAll={setAll}
              />
            )}

            {done && (
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Badge variant="success">
                  <IconCircleCheck size={14} /> Done — change undone
                </Badge>
              </div>
            )}

            {!done &&
              (result.reverted.length > 0 || result.conflicts.length > 0) && (
                <div className="flex gap-2">
                  <Button onClick={onApply} disabled={loading}>
                    {loading
                      ? 'Working…'
                      : result.conflicts.length
                        ? 'Undo with these choices'
                        : 'Yes, undo this'}
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

            {/* Nothing to undo (e.g. everything was guarded) */}
            {!done &&
              result.reverted.length === 0 &&
              result.conflicts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  There’s nothing to put back for this action.
                </p>
              )}
          </div>
        )}
      </div>
    </section>
  );
};
