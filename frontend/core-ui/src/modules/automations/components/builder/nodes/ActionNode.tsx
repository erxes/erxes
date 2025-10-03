import { NodeOutputHandler } from '@/automations/components/builder/nodes/NodeOutputHandler';
import { IconAdjustmentsAlt } from '@tabler/icons-react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { cn, IconComponent } from 'erxes-ui';
import { memo } from 'react';
import { NodeData } from '../../../types';
import { ErrorState } from '../../../utils/ErrorState';
import { ActionNodeConfigurationContent } from './ActionNodeConfigurationContent';
import { NodeDropdownActions } from './NodeDropdownActions';

const ActionNodeContent = ({ data }: { data: NodeData }) => {
  if (data?.error) {
    return (
      <ErrorState errorCode={'Invalid action'} errorDetails={data?.error} />
    );
  }

  if (data.type === 'if') {
    return null;
  }

  if (!Object.keys(data?.config || {}).length) {
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

const ActionNodeSourceHandler = ({
  id,
  type,
  nextActionId,
  config,
}: {
  id: string;
  type: string;
  nextActionId?: string;
  config?: any;
}) => {
  if (type === 'if') {
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
          nodeType="action"
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
          nodeType="action"
        >
          <div className="ml-4 text-xs text-muted-foreground fixed -top-2">
            False
          </div>
        </NodeOutputHandler>
      </>
    );
  }

  return (
    <NodeOutputHandler
      className="!bg-success"
      handlerId={id}
      addButtonClassName="hover:text-success  hover:border-success"
      showAddButton={!nextActionId}
      nodeType="action"
    />
  );
};

const ActionNode = ({ data, selected, id }: NodeProps<Node<NodeData>>) => {
  const { beforeTitleContent, config, nextActionId } = data;

  return (
    <div className="flex flex-col" key={id}>
      <div className="w-1/4 ml-1 bg-success/10 text-success text-center px-2 py-1 rounded-t-md">
        <p className="font-medium font-bold">Action</p>
      </div>
      <div
        className={cn(
          'rounded-md shadow-md bg-background border border-muted w-[280px] font-mono',
          selected ? 'ring-2 ring-success ring-offset-2' : '',
          data?.error ? 'ring-2 ring-red-300 ring-offset-2' : '',
          'transition-all duration-200',
        )}
      >
        <div className="p-3 flex items-center justify-between border-b border-muted">
          <div className="flex items-center gap-2 text-success/90">
            {beforeTitleContent && beforeTitleContent(id, 'action')}

            <div
              className={`size-6 rounded-full bg-success/10  flex items-center justify-center`}
            >
              <IconComponent className="size-4" name={data.icon} />
            </div>
            <span className="font-medium">{data.label}</span>
          </div>

          <div className="flex items-center gap-1">
            <NodeDropdownActions id={id} data={data} />
          </div>
        </div>

        <div className="p-3 border-b border-muted ">
          <span className="text-xs text-accent-foreground font-medium">
            {data.description}
          </span>
        </div>
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
          config={config}
        />
      </div>
    </div>
  );
};

export default memo(ActionNode);
