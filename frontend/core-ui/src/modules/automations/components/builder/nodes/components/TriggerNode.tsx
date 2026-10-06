import { FolksActionSourceHandler } from '@/automations/components/builder/nodes/components/FolksActionSourceHandler';
import { NodeDropdownActions } from '@/automations/components/builder/nodes/components/NodeDropdownActions';
import {
  NodeErrorDisplay,
  NodeErrorIndicator,
} from '@/automations/components/builder/nodes/components/NodeErrorDisplay';
import { NodeWarningIndicator } from '@/automations/components/builder/nodes/components/NodeWarningIndicator';
import { NodeFrame } from '@/automations/components/builder/nodes/components/NodeFrame';
import { NodeIssuesProvider } from '@/automations/components/builder/nodes/components/NodeIssuesProvider';
import { NodeOutputHandler } from '@/automations/components/builder/nodes/components/NodeOutputHandler';
import { ReadOnlyNodeHandles } from '@/automations/components/builder/nodes/components/ReadOnlyNodeHandles';
import { SegmentMembershipNodeContent } from '@/automations/components/builder/nodes/components/SegmentMembershipNodeContent';
import { TriggerNodeConfigurationContent } from '@/automations/components/builder/nodes/components/TriggerNodeConfigurationContent';
import { useNodeContent } from '@/automations/components/builder/nodes/hooks/useTriggerNodeContent';
import { useTriggerNodeFolks } from '@/automations/components/builder/nodes/hooks/useTriggerNodeFolks';
import { isSegmentMembershipTrigger } from '@/automations/utils/automationBuilderUtils/triggerFolks';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { Node, NodeProps } from '@xyflow/react';
import { cn, IconComponent } from 'erxes-ui';
import { memo } from 'react';

// Configuration content wrapper
const ConfigurationContent = ({
  type,
  config,
}: {
  type: string;
  config: any;
}) => (
  <div className="rounded border bg-muted overflow-x-auto text-muted-foreground text-xs font-mono">
    <TriggerNodeConfigurationContent type={type} config={config} />
  </div>
);

// Main configuration section
const ConfigurationSection = ({ data }: { data: NodeData }) => (
  <div className="p-3">
    <ConfigurationContent type={data.type || ''} config={data.config} />
  </div>
);

const TriggerNodeContent = ({ data }: { data: NodeData }) => {
  const { hasError, shouldRender } = useNodeContent(
    data,
    AutomationNodeType.Trigger,
  );

  if (!shouldRender || hasError) {
    return null;
  }

  return (
    <NodeIssuesProvider nodeId={data.id} readOnly={data.readOnly}>
      <ConfigurationSection data={data} />
    </NodeIssuesProvider>
  );
};

const TriggerNodeSourceHandler = ({
  id,
  data,
}: {
  id: string;
  data: NodeData;
}) => {
  const { folks, hasFolks } = useTriggerNodeFolks(data.config);

  if (hasFolks) {
    return (
      <FolksActionSourceHandler
        nodeId={id}
        config={data.config}
        folks={folks}
        flowDirection={data.flowDirection}
        nodeType={AutomationNodeType.Trigger}
      />
    );
  }

  return (
    <NodeOutputHandler
      nodeType={AutomationNodeType.Trigger}
      handlerId={id}
      className="!border-primary"
      addButtonClassName="hover:border-primary hover:text-primary "
      showAddButton={!data.actionId}
      flowDirection={data.flowDirection}
    />
  );
};

const TriggerNode = ({ data, selected, id }: NodeProps<Node<NodeData>>) => {
  const { beforeTitleContent } = data;

  return (
    <NodeFrame
      label="Trigger"
      actions={!data.readOnly && <NodeDropdownActions id={id} data={data} />}
      className={cn({
        'ring-2 ring-primary': selected,
        'ring-2 ring-destructive': data?.error,
      })}
    >
      <div className="p-3 flex items-center justify-between border-b gap-8">
        <div className="flex items-center gap-2">
          {beforeTitleContent?.(id, AutomationNodeType.Trigger)}
          <div className="size-7 shrink-0 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <IconComponent className="size-4" name={data.icon} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{data.label}</p>
          </div>
          {data?.error && <NodeErrorIndicator error={data.error} />}
          {!data?.error && !data.readOnly && (
            <NodeWarningIndicator nodeId={id} />
          )}
        </div>
      </div>
      <div className="p-3">
        <span className="text-xs text-accent-foreground ">
          {data.description}
        </span>

        {data?.error && (
          <div className="mt-2">
            <NodeErrorDisplay
              error={data.error}
              nodeId={id}
              onClearError={(nodeId) => {
                // Clear error logic can be added here
              }}
            />
          </div>
        )}

        {isSegmentMembershipTrigger(data.config) ? (
          <SegmentMembershipNodeContent segmentId={data.config?.segmentId} />
        ) : (
          <TriggerNodeContent data={{ ...data, id }} />
        )}
      </div>

      {data.readOnly ? (
        <ReadOnlyNodeHandles flowDirection={data.flowDirection} />
      ) : (
        <TriggerNodeSourceHandler id={id} data={data} />
      )}
    </NodeFrame>
  );
};

export default memo(TriggerNode);
