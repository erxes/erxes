import { useActionNodeConfiguration } from '@/automations/components/builder/nodes/hooks/useActionNodeConfiguration';
import { useNodeContent } from '@/automations/components/builder/nodes/hooks/useTriggerNodeContent';
import {
  NodeErrorDisplay,
  NodeErrorIndicator,
} from '@/automations/components/builder/nodes/components/NodeErrorDisplay';
import { NodeDropdownActions } from '@/automations/components/builder/nodes/components/NodeDropdownActions';
import { NodeOutputHandler } from '@/automations/components/builder/nodes/components/NodeOutputHandler';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Handle, Position } from '@xyflow/react';
import { cn, Empty, IconComponent, Skeleton } from 'erxes-ui';
import { memo, Suspense } from 'react';
import { FieldPath, useFormContext, useWatch } from 'react-hook-form';

/**
 * Broadcast's own action node.
 *
 * The builder colours nodes to tell a trigger from an action; in a campaign
 * every step is an action, so that colouring only adds noise. Rather than
 * teaching the shared node about broadcast, this is a separate node with the
 * same parts: header, configuration summary, handles.
 */
const BroadcastActionNodeContent = ({
  data,
  selected,
  id,
}: {
  data: NodeData;
  selected?: boolean;
  id: string;
}) => {
  const { nextActionId, error } = data;

  return (
    <div
      key={id}
      className={cn(
        'relative w-[280px] animate-in rounded-xl border bg-background fade-in zoom-in-95 duration-200',
        {
          'ring-2 ring-primary': selected,
          'ring-2 ring-destructive': error,
        },
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Empty.Media variant="icon" className="size-8 [&>svg]:size-4">
            <IconComponent name={data.icon} />
          </Empty.Media>
          <span className="truncate text-sm font-medium">{data.label}</span>
          {error && <NodeErrorIndicator error={error} />}
        </div>

        {!data.readOnly && <NodeDropdownActions id={id} data={data} />}
      </div>

      {/* Several actions describe themselves with their own name; repeating it
          under the title says nothing. */}
      {data.description && data.description !== data.label && (
        <div className="border-b px-3 py-2">
          <span className="text-xs text-muted-foreground">
            {data.description}
          </span>
        </div>
      )}

      <BroadcastActionConfigSummary data={{ ...data, id }} />

      {error && (
        <div className="p-3 pt-0">
          <NodeErrorDisplay error={error} nodeId={id} />
        </div>
      )}

      <Handle
        key="left"
        id="left"
        type="target"
        position={Position.Left}
        className="!size-4 -z-10 !bg-primary"
      />

      <NodeOutputHandler
        handlerId={id}
        nodeType={AutomationNodeType.Action}
        className="!bg-primary"
        addButtonClassName="hover:border-primary hover:text-primary"
        showAddButton={!nextActionId && !data.readOnly}
      />
    </div>
  );
};

/**
 * The step's own summary of what it is configured to do.
 *
 * The builder's version heads this with a green "Configuration" label, which
 * in a flow of nothing but actions only adds colour; the summary itself is
 * rendered by the very same action components.
 */
const BroadcastActionConfigSummary = ({ data }: { data: NodeData }) => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const actionData = useWatch({
    control,
    name: data.formPath as FieldPath<TAutomationBuilderForm>,
  });

  const { Component } = useActionNodeConfiguration(data, actionData);
  const { hasError, shouldRender } = useNodeContent(
    data,
    AutomationNodeType.Action,
  );

  if (!shouldRender || hasError || !Component || !actionData) {
    return null;
  }

  return (
    <div className="p-3">
      <div className="overflow-x-auto rounded border bg-muted text-muted-foreground">
        {/* Action content loads lazily; without a boundary here the closest one
            is the route's, which blanks the whole page on first render */}
        <Suspense fallback={<Skeleton className="m-2 h-8" />}>
          {Component}
        </Suspense>
      </div>
    </div>
  );
};

export const BroadcastActionNode = memo(BroadcastActionNodeContent);
