import { reportedNodeIssuesAtom } from '@/automations/states/automationNodeIssuesState';
import {
  isSegmentMembershipTrigger,
  triggerStartActionIds,
} from '@/automations/utils/automationBuilderUtils/triggerFolks';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type TAutomationNodeIssues = {
  nodeId: string;
  label: string;
  issues: string[];
};

type TNodeValues = {
  id: string;
  label?: string;
  isCustom?: boolean;
  actionId?: string;
  nextActionId?: string;
  config?: Record<string, unknown>;
};

const isEmptyConfig = (config?: Record<string, unknown>) =>
  !config || !Object.keys(config).length;

// Branch targets live in the config under per-action keys (`yes`, `isExists`,
// `optionalConnects[].actionId`, …); any id-shaped value there that names a
// node counts as a connection.
const targetsOf = (node: TNodeValues): string[] => {
  const config = node.config || {};
  const connects = Array.isArray(config.optionalConnects)
    ? (config.optionalConnects as { actionId?: unknown }[]).map(
        ({ actionId }) => actionId,
      )
    : [];

  return [node.nextActionId, ...Object.values(config), ...connects].filter(
    (value): value is string => typeof value === 'string' && !!value,
  );
};

/** Steps no trigger leads to never run. */
const unreachableIds = (
  triggers: TNodeValues[],
  steps: TNodeValues[],
): Set<string> => {
  const byId = new Map(steps.map((step) => [step.id, step]));
  const reached = new Set<string>();
  const queue = triggers
    .flatMap(triggerStartActionIds)
    .filter((id) => byId.has(id));

  while (queue.length) {
    const id = queue.shift() as string;

    if (reached.has(id)) {
      continue;
    }

    reached.add(id);
    queue.push(
      ...targetsOf(byId.get(id) as TNodeValues).filter(
        (target) => byId.has(target) && !reached.has(target),
      ),
    );
  }

  return new Set(steps.map(({ id }) => id).filter((id) => !reached.has(id)));
};

/**
 * Every node's missing configuration: the rules the builder knows itself
 * (a segment on a standard trigger, a node never configured) plus whatever
 * each node's content reported.
 */
export const useAutomationNodeIssues = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAutomationBuilderForm>();
  const [triggers = [], actions = [], workflows = []] = useWatch({
    control,
    name: ['triggers', 'actions', 'workflows'],
  });
  const reported = useAtomValue(reportedNodeIssuesAtom);

  const nodeIssues = useMemo<TAutomationNodeIssues[]>(() => {
    const unreachable = unreachableIds(triggers as TNodeValues[], [
      ...(actions as TNodeValues[]),
      ...(workflows as TNodeValues[]),
    ]);

    const ownIssues = (node: TNodeValues, isTrigger: boolean) => {
      if (isTrigger && isSegmentMembershipTrigger(node.config)) {
        return [
          ...(node.config?.segmentId ? [] : [t('node-issue-no-segment')]),
          ...(triggerStartActionIds(node).length
            ? []
            : [t('node-issue-no-branch')]),
        ];
      }

      if (isTrigger && !node.isCustom) {
        return node.config?.contentId ? [] : [t('node-issue-no-segment')];
      }

      return [
        // Content renders only once there is a config, so it cannot say this.
        ...(isEmptyConfig(node.config) ? [t('node-issue-not-configured')] : []),
        ...(!isTrigger && unreachable.has(node.id)
          ? [t('node-issue-unreachable')]
          : []),
      ];
    };

    return [
      ...(triggers as TNodeValues[]).map((node) => ({ node, isTrigger: true })),
      ...(actions as TNodeValues[]).map((node) => ({ node, isTrigger: false })),
    ]
      .map(({ node, isTrigger }) => ({
        nodeId: node.id,
        label: node.label || '',
        issues: [
          ...new Set([
            ...ownIssues(node, isTrigger),
            ...(reported[node.id] || []),
          ]),
        ],
      }))
      .filter(({ issues }) => issues.length > 0);
  }, [actions, reported, t, triggers, workflows]);

  const issuesOf = useCallback(
    (nodeId: string) =>
      nodeIssues.find((node) => node.nodeId === nodeId)?.issues || [],
    [nodeIssues],
  );

  return { nodeIssues, issuesOf };
};

/** The reporter a node's content writes through, bound to that node. */
export const useNodeIssuesReporter = (nodeId: string) => {
  const setReported = useSetAtom(reportedNodeIssuesAtom);

  return useCallback(
    (issues: string[]) =>
      setReported((current) => {
        const previous = current[nodeId] || [];

        if (
          previous.length === issues.length &&
          previous.every((issue, index) => issue === issues[index])
        ) {
          return current;
        }

        return { ...current, [nodeId]: issues };
      }),
    [nodeId, setReported],
  );
};
