import { useLazyQuery } from '@apollo/client';
import { useNodeErrorHandler } from '@/automations/components/builder/hooks/useNodeErrorHandler';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AUTOMATION_PREFLIGHT } from '@/automations/graphql/automationQueries';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { byUrgency, toPreflightReport } from './preflightReport';

// The checks arrive in one answer; each is shown a beat apart so it can be
// read, not to pretend it took longer.
const REVEAL_MS = 260;

export type TAutomationPreflight = ReturnType<typeof useAutomationPreflight>;

/** Checks the flow as it stands in the builder, unsaved edits included, before it goes live. */
export const useAutomationPreflight = (open: boolean) => {
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const { detail, setQueryParams, setSidebarOpen, reactFlowInstance } =
    useAutomation();
  const { handleNodeErrors } = useNodeErrorHandler();
  const { triggers, actions } = useAutomationNodes();
  const markNodes = useRef(handleNodeErrors);
  const [check, { data, loading, error }] = useLazyQuery(AUTOMATION_PREFLIGHT, {
    fetchPolicy: 'network-only',
  });
  const [revealed, setRevealed] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const run = useCallback(() => {
    // Nodes loaded from the detail query carry __typename, which no input
    // type accepts; the save drops it by parsing the form, this drops it here.
    const { triggers, actions, workflows } = JSON.parse(
      JSON.stringify(getValues(), (key, value) =>
        key === '__typename' ? undefined : value,
      ),
    );

    setRevealed(0);
    setElapsedMs(0);
    setStartedAt(Date.now());
    check({
      variables: { _id: detail?._id, triggers, actions, workflows },
    });
  }, [check, detail?._id, getValues]);

  useEffect(() => {
    if (open) {
      run();
    }
  }, [open, run]);

  const report = useMemo(
    () => (loading ? null : toPreflightReport(data?.automationValidate)),
    [data, loading],
  );
  const total = report?.checks.length || 0;
  const done = !!report && revealed >= total;

  useEffect(() => {
    if (!report || revealed >= total) {
      return;
    }

    const timer = setTimeout(
      () => setRevealed((count) => count + 1),
      REVEAL_MS,
    );

    return () => clearTimeout(timer);
  }, [report, revealed, total]);

  useEffect(() => {
    if (!open || done || error) {
      return;
    }

    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), 100);

    return () => clearInterval(timer);
  }, [open, done, error, startedAt]);

  const failing = useMemo(
    () => (report?.checks || []).filter(({ status }) => status === 'bad'),
    [report],
  );

  useEffect(() => {
    markNodes.current = handleNodeErrors;
  });

  // The canvas keeps the failing steps marked after the dialog closes.
  useEffect(() => {
    if (!done || !failing.length) {
      return;
    }

    markNodes.current(
      Object.fromEntries(
        failing.flatMap(({ items }) =>
          items.map(({ nodeId, message }) => [nodeId, message]),
        ),
      ),
      false,
    );
  }, [done, failing]);

  const openNode = (nodeId: string) => {
    setSidebarOpen(true);
    setQueryParams({ activeNodeId: nodeId });
    reactFlowInstance?.fitView({ nodes: [{ id: nodeId }], duration: 800 });
  };

  const labelOf = (nodeId: string) =>
    [...triggers, ...actions].find(({ id }) => id === nodeId)?.label || nodeId;

  const checks = report?.checks || [];
  const issueCount = failing.reduce(
    (count, { items }) => count + items.length,
    0,
  );
  const toneOf = () => {
    if (error) {
      return 'unavailable';
    }

    if (!done) {
      return 'progress';
    }

    return issueCount ? 'bad' : 'ok';
  };

  return {
    run,
    openNode,
    labelOf,
    loading,
    failed: !!error,
    done,
    elapsedMs,
    checks: done ? byUrgency(checks) : checks,
    revealed,
    issueCount,
    tone: toneOf(),
    canActivate: done && !!report?.canActivate,
  };
};
