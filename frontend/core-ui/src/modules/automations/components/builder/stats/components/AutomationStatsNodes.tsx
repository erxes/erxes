import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { TAutomationStatsNode } from '@/automations/types';
import { Badge, Table, TextOverflowTooltip } from 'erxes-ui';
import { useCallback } from 'react';

const formatDuration = (ms?: number) => {
  if (ms === undefined || ms === null) {
    return '—';
  }

  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
};

const formatErrorCode = (code: string) =>
  code.toLowerCase().split('_').join(' ');

/** Resolves a stats actionId back to the node label shown on the canvas. */
const useNodeLabel = () => {
  const { actions, workflows } = useAutomationNodes();
  const { actionsConst } = useAutomation();

  return useCallback(
    ({ actionId, actionType }: TAutomationStatsNode) => {
      const node =
        actions.find(({ id }) => id === actionId) ??
        workflows
          .flatMap(({ actions: memberActions = [] }) => memberActions)
          .find(({ id }) => id === actionId);

      const typeLabel = actionsConst.find(
        ({ type }) => type === (node?.type || actionType),
      )?.label;

      return {
        label: node?.label || typeLabel || actionType || actionId,
        typeLabel: typeLabel || node?.type || actionType,
        isRemoved: !node,
      };
    },
    [actions, workflows, actionsConst],
  );
};

export const AutomationStatsNodes = ({
  nodes,
}: {
  nodes: TAutomationStatsNode[];
}) => {
  const getNodeLabel = useNodeLabel();

  if (!nodes.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border bg-background text-sm text-muted-foreground">
        No actions have run yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className="px-3">Action</Table.Head>
            <Table.Head className="px-3 text-right">Runs</Table.Head>
            <Table.Head className="px-3 text-right">Failed</Table.Head>
            <Table.Head className="px-3 text-right">Avg</Table.Head>
            <Table.Head className="px-3 text-right">Max</Table.Head>
            <Table.Head className="px-3">Reasons</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {nodes.map((node) => {
            const { label, typeLabel, isRemoved } = getNodeLabel(node);

            return (
              <Table.Row key={node.actionId}>
                {/* w-full + max-w-0 lets this column absorb the leftover width
                    and truncate, instead of pushing text past the cell. */}
                <Table.Cell className="w-full max-w-0 px-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <TextOverflowTooltip
                      value={label}
                      className="flex-1 font-medium"
                    />
                    <span className="min-w-0 shrink-[2] truncate text-xs text-muted-foreground">
                      {typeLabel}
                      {isRemoved && ' · removed from canvas'}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell className="px-3 text-right tabular-nums">
                  {node.total}
                </Table.Cell>
                <Table.Cell className="px-3 text-right tabular-nums">
                  {node.error ? (
                    <span className="text-destructive">{node.error}</span>
                  ) : (
                    '—'
                  )}
                </Table.Cell>
                <Table.Cell className="px-3 text-right tabular-nums">
                  {formatDuration(node.avgDurationMs)}
                </Table.Cell>
                <Table.Cell className="px-3 text-right tabular-nums">
                  {formatDuration(node.maxDurationMs)}
                </Table.Cell>
                <Table.Cell className="px-3">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {node.errorCodes.map(({ key, count }) => (
                      <Badge
                        key={key}
                        variant="destructive"
                        className="shrink-0"
                      >
                        {formatErrorCode(key)} {count}
                      </Badge>
                    ))}
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};
