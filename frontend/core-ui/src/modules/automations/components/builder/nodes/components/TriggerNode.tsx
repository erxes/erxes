import { NodeDropdownActions } from '@/automations/components/builder/nodes/components/NodeDropdownActions';
import {
  NodeErrorDisplay,
  NodeErrorIndicator,
} from '@/automations/components/builder/nodes/components/NodeErrorDisplay';
import { NodeOutputHandler } from '@/automations/components/builder/nodes/components/NodeOutputHandler';
import { TriggerNodeConfigurationContent } from '@/automations/components/builder/nodes/components/TriggerNodeConfigurationContent';
import { useNodeContent } from '@/automations/components/builder/nodes/hooks/useTriggerNodeContent';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { IconAdjustmentsAlt } from '@tabler/icons-react';
import { Node, NodeProps } from '@xyflow/react';
import { cn, IconComponent } from 'erxes-ui';
import { memo } from 'react';

// Configuration header component
const ConfigurationHeader = () => (
  <div className="flex items-center gap-2 text-primary/90 pb-2">
    <IconAdjustmentsAlt className="size-4" />
    <p className="text-sm font-semibold">Configuration</p>
  </div>
);

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
    <ConfigurationHeader />
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

  return <ConfigurationSection data={data} />;
};

const TriggerNode = ({ data, selected, id }: NodeProps<Node<NodeData>>) => {
  const { beforeTitleContent, actionId } = data;

  return (
    <div className="flex flex-col ">
      <div className="w-1/4 ml-1 bg-primary/10 text-primary text-center px-2 py-1 rounded-t-md">
        <p className="font-medium font-bold">Trigger</p>
      </div>
      <div
        className={cn(
          'rounded-md shadow-md bg-background w-[280px] relative font-mono transition-all duration-200',
          {
            'ring-2 ring-primary': selected,
            'ring-2 ring-red-300': data?.error,
          },
        )}
      >
        <div className="p-3 flex items-center justify-between border-b border-slate-200 gap-8">
          <div className="flex items-center gap-2 text-primary">
            {beforeTitleContent &&
              beforeTitleContent(id, AutomationNodeType.Trigger)}
            <div
              className={`size-6 rounded-full flex items-center justify-center`}
            >
              <IconComponent className="size-4" name={data.icon} />
            </div>
            <div className="flex-1">
              <p className="font-medium ">{data.label}</p>
            </div>
            {data?.error && <NodeErrorIndicator error={data.error} />}
          </div>

          <div className="flex items-center gap-1">
            <NodeDropdownActions id={id} data={data} />
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

          <TriggerNodeContent data={data} />
        </div>

        <NodeOutputHandler
          nodeType={AutomationNodeType.Trigger}
          handlerId={id}
          className="!bg-primary"
          addButtonClassName="hover:border-primary hover:text-primary "
          showAddButton={!actionId}
        />
      </div>
    </div>
  );
};

export default memo(TriggerNode);
