import { ActionNodeConfigurationContent } from '@/automations/components/builder/nodes/components/ActionNodeConfigurationContent';
import { FolksActionSourceHandler } from '@/automations/components/builder/nodes/components/FolksActionSourceHandler';
import { NodeDropdownActions } from '@/automations/components/builder/nodes/components/NodeDropdownActions';
import {
  NodeErrorDisplay,
  NodeErrorIndicator,
} from '@/automations/components/builder/nodes/components/NodeErrorDisplay';
import { NodeWarningIndicator } from '@/automations/components/builder/nodes/components/NodeWarningIndicator';
import { NodeFrame } from '@/automations/components/builder/nodes/components/NodeFrame';
import { NodeOutputHandler } from '@/automations/components/builder/nodes/components/NodeOutputHandler';
import { ReadOnlyNodeHandles } from '@/automations/components/builder/nodes/components/ReadOnlyNodeHandles';
import { useActionNodeSourceHandler } from '@/automations/components/builder/nodes/hooks/useActionNodeSourceHandler';
import { isBranchingOnError } from '@/automations/utils/automationBuilderUtils/actionFolks';
import { TAutomationFlowDirection } from '@/automations/constants/flowDirection';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { Handle, Position } from '@xyflow/react';
import { cn, IconComponent } from 'erxes-ui';
import { memo } from 'react';

const ActionNodeSourceHandler = ({
  id,
  type,
  nextActionId,
  config,
  workflowId,
  flowDirection,
}: {
  id: string;
  type: string;
  nextActionId?: string;
  config?: any;
  workflowId?: string;
  flowDirection?: TAutomationFlowDirection;
}) => {
  if (type === 'split') {
    return null;
  }
  const { hasFolks, folks } = useActionNodeSourceHandler(type, config);
  if (hasFolks) {
    return (
      <FolksActionSourceHandler
        nodeId={id}
        config={config}
        folks={folks}
        flowDirection={flowDirection}
      />
    );
  }

  return (
    <NodeOutputHandler
      className="!border-success"
      handlerId={id}
      addButtonClassName="hover:text-success  hover:border-success"
      showAddButton={!nextActionId && !workflowId}
      nodeType={AutomationNodeType.Action}
      flowDirection={flowDirection}
    />
  );
};

/** What the node's error policy does, said on the canvas rather than in a form. */
const ActionErrorPolicyBadge = ({ config }: { config?: any }) => {
  const attempts = Number(config?.errorPolicy?.retry?.attempts || 0);
  const branching = isBranchingOnError(config);

  if (!attempts && !branching) {
    return null;
  }

  return (
    <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
      {[attempts > 0 && `retry x${attempts}`, branching && 'on error']
        .filter(Boolean)
        .join(' · ')}
    </span>
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
      <div className="p-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          {beforeTitleContent?.(id, AutomationNodeType.Action)}

          <div className="size-7 shrink-0 rounded-md bg-success/10 text-success flex items-center justify-center">
            <IconComponent className="size-4" name={data.icon} />
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold">{data.label}</span>
          </div>
          {error && <NodeErrorIndicator error={error} />}
          {!error && !data.readOnly && <NodeWarningIndicator nodeId={id} />}
          <ActionErrorPolicyBadge config={data.config} />
        </div>
      </div>
      {(data.description || error) && (
        <div className="p-3 border-b">
          <span className="text-xs text-muted-foreground">
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
      )}
    </>
  );
};

const ActionNode = ({ data, selected, id, ...props }: any) => {
  const { beforeTitleContent, config, nextActionId, workflowId, error } = data;
  const isVertical = data.flowDirection === 'vertical';

  return (
    <NodeFrame
      key={id}
      label="Action"
      actions={!data.readOnly && <NodeDropdownActions id={id} data={data} />}
      className={cn('animate-in fade-in zoom-in-95', {
        'ring-2 ring-success': selected,
        'ring-2 ring-destructive': error,
      })}
    >
      <ActionNodeHeader
        data={data}
        beforeTitleContent={beforeTitleContent}
        error={error}
        id={id}
      />

      <ActionNodeConfigurationContent data={{ ...data, id }} />

      {data.readOnly ? (
        <ReadOnlyNodeHandles flowDirection={data.flowDirection} />
      ) : (
        <>
          <Handle
            key="left"
            id="left"
            type="target"
            position={isVertical ? Position.Top : Position.Left}
            className={cn('!size-3 !border-2 !border-success !bg-background', {
              '!left-1/2 !top-0 -translate-x-1/2': isVertical,
            })}
          />

          <ActionNodeSourceHandler
            id={id}
            type={data.type}
            nextActionId={nextActionId}
            workflowId={workflowId}
            config={config}
            flowDirection={data.flowDirection}
          />
        </>
      )}
    </NodeFrame>
  );
};

export default memo(ActionNode);
