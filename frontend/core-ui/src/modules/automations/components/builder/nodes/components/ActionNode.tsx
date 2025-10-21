import { ActionNodeConfigurationContent } from '@/automations/components/builder/nodes/components/ActionNodeConfigurationContent';
import { FolksActionSourceHandler } from '@/automations/components/builder/nodes/components/FolksActionSourceHandler';
import { NodeDropdownActions } from '@/automations/components/builder/nodes/components/NodeDropdownActions';
import {
  NodeErrorDisplay,
  NodeErrorIndicator,
} from '@/automations/components/builder/nodes/components/NodeErrorDisplay';
import { NodeOutputHandler } from '@/automations/components/builder/nodes/components/NodeOutputHandler';
import { useActionNodeSourceHandler } from '@/automations/components/builder/nodes/hooks/useActionNodeSourceHandler';
import { useNodeContent } from '@/automations/components/builder/nodes/hooks/useTriggerNodeContent';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { IconAdjustmentsAlt } from '@tabler/icons-react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { cn, IconComponent } from 'erxes-ui';
import { memo } from 'react';

const ActionNodeContent = ({ data }: { data: NodeData }) => {
  const { hasError, shouldRender } = useNodeContent(
    data,
    AutomationNodeType.Action,
  );

  if (!shouldRender || hasError) {
    return null;
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 text-success/90 pb-2">
        <IconAdjustmentsAlt className="size-4" />
        <p className="text-sm font-semibold">Configuration</p>
      </div>
      <div className="rounded border bg-muted text-muted-foreground overflow-x-auto">
        <ActionNodeConfigurationContent data={data} />
      </div>
    </div>
  );
};

const IfActionSourceHandler = ({
  id,
  config,
}: {
  id: string;
  config?: any;
}) => {
  return (
    <>
      <NodeOutputHandler
        key="yes-right"
        id="yes-right"
        handlerId={`${id}__yes`}
        className="!bg-success"
        addButtonClassName="hover:text-success hover:border-success"
        style={{ top: '50%' }}
        showAddButton={!config?.yes}
        nodeType={AutomationNodeType.Action}
      >
        <div className="ml-4 text-xs text-muted-foreground fixed -top-2">
          True
        </div>
      </NodeOutputHandler>
      <NodeOutputHandler
        key="no-right"
        id="no-right"
        handlerId={`${id}__no`}
        className="!bg-destructive"
        addButtonClassName="hover:text-destructive hover:border-destructive"
        style={{ top: '80%' }}
        showAddButton={!config?.no}
        nodeType={AutomationNodeType.Action}
      >
        <div className="ml-4 text-xs text-muted-foreground fixed -top-2">
          False
        </div>
      </NodeOutputHandler>
    </>
  );
};

const FindObjectActionSourceHandler = ({
  id,
  config,
}: {
  id: string;
  config?: any;
}) => {
  return (
    <>
      <NodeOutputHandler
        key="isExists-right"
        id="isExists-right"
        handlerId={`${id}__isExists`}
        className="!bg-success"
        addButtonClassName="hover:text-success hover:border-success"
        style={{ top: '50%' }}
        showAddButton={!config?.isExists}
        nodeType={AutomationNodeType.Action}
      >
        <div className="ml-4 text-xs text-muted-foreground fixed -top-2">
          Has
        </div>
      </NodeOutputHandler>
      <NodeOutputHandler
        key="notExists-right"
        id="notExists-right"
        handlerId={`${id}__notExists`}
        className="!bg-destructive"
        addButtonClassName="hover:text-destructive hover:border-destructive"
        style={{ top: '80%' }}
        showAddButton={!config?.notExists}
        nodeType={AutomationNodeType.Action}
      >
        <div className="ml-4 text-xs text-muted-foreground fixed -top-2">
          None
        </div>
      </NodeOutputHandler>
    </>
  );
};

const ActionNodeSourceHandler = ({
  id,
  type,
  nextActionId,
  config,
  workflowId,
}: {
  id: string;
  type: string;
  nextActionId?: string;
  config?: any;
  workflowId?: string;
}) => {
  const { hasFolks, folks } = useActionNodeSourceHandler(type);

  if (hasFolks) {
    return (
      <FolksActionSourceHandler nodeId={id} config={config} folks={folks} />
    );
  }

  return (
    <NodeOutputHandler
      className="!bg-success"
      handlerId={id}
      addButtonClassName="hover:text-success  hover:border-success"
      showAddButton={!nextActionId && !workflowId}
      nodeType={AutomationNodeType.Action}
    />
  );
};

const ActionNodeHeader = ({
  data,
  beforeTitleContent,
  error,
  id,
}: {
  data: NodeData;
  beforeTitleContent?: (
    id: string,
    nodeType: AutomationNodeType,
  ) => React.ReactNode;
  error?: string;
  id: string;
}) => {
  return (
    <>
      <div className="p-3 flex items-center justify-between border-b border-muted">
        <div className="flex items-center gap-2 text-success/90">
          {beforeTitleContent &&
            beforeTitleContent(id, AutomationNodeType.Action)}

          <div
            className={`size-6 rounded-full bg-success/10  flex items-center justify-center`}
          >
            <IconComponent className="size-4" name={data.icon} />
          </div>
          <div className="flex-1">
            <span className="font-medium">{data.label}</span>
          </div>
          {error && <NodeErrorIndicator error={error} />}
        </div>

        <div className="flex items-center gap-1">
          <NodeDropdownActions id={id} data={data} />
        </div>
      </div>
      <div className="p-3 border-b border-muted ">
        <span className="text-xs text-accent-foreground font-medium">
          {data.description}
        </span>

        {error && (
          <div className="mt-2">
            <NodeErrorDisplay
              error={error}
              nodeId={id}
              onClearError={(nodeId) => {
                // Clear error logic can be added here
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

const ActionNode = ({ data, selected, id }: NodeProps<Node<NodeData>>) => {
  const { beforeTitleContent, config, nextActionId, workflowId, error } = data;

  return (
    <div className="flex flex-col" key={id}>
      <div className="w-1/4 ml-1 bg-success/10 text-success text-center px-2 py-1 rounded-t-md">
        <p className="font-medium font-bold">Action</p>
      </div>
      <div
        className={cn(
          'rounded-md shadow-md bg-background border border-muted w-[280px] font-mono transition-all duration-200',
          {
            'ring-2 ring-success': selected,
            'ring-2 ring-red-300': error,
          },
        )}
      >
        <ActionNodeHeader
          data={data}
          beforeTitleContent={beforeTitleContent}
          error={error}
          id={id}
        />

        <ActionNodeContent data={{ ...data, id }} />

        <Handle
          key="left"
          id="left"
          type="target"
          position={Position.Left}
          className={`!size-4 -z-10 !bg-success `}
        />

        <ActionNodeSourceHandler
          id={id}
          type={data.type}
          nextActionId={nextActionId}
          workflowId={workflowId}
          config={config}
        />
      </div>
    </div>
  );
};

export default memo(ActionNode);
