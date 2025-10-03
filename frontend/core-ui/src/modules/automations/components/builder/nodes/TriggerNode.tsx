import { NodeOutputHandler } from '@/automations/components/builder/nodes/NodeOutputHandler';
import { NodeData } from '@/automations/types';
import { IconAdjustmentsAlt } from '@tabler/icons-react';
import { Node, NodeProps } from '@xyflow/react';
import { cn, IconComponent } from 'erxes-ui';
import { memo } from 'react';
import { NodeDropdownActions } from './NodeDropdownActions';
import { TriggerNodeConfigurationContent } from './TriggerNodeConfigurationContent';
import { ErrorState } from '@/automations/utils/ErrorState';

const TriggerNodeContent = ({ data }: { data: NodeData }) => {
  if (data?.error) {
    return (
      <ErrorState errorCode={'Invalid action'} errorDetails={data?.error} />
    );
  }

  if (!data?.isCustom) {
    return null;
  }

  if (!Object.keys(data?.config || {}).length) {
    return null;
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 text-primary/90 pb-2">
        <IconAdjustmentsAlt className="size-4" />
        <p className="text-sm font-semibold">Configuration</p>
      </div>
      <div className="rounded border bg-muted overflow-x-auto text-muted-foreground text-xs font-mono">
        <TriggerNodeConfigurationContent
          type={data.type || ''}
          config={data.config}
        />
      </div>
    </div>
  );
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
          'rounded-md shadow-md bg-background w-[280px] relative font-mono',
          selected ? 'ring-2 ring-primary ring-offset-2' : '',
          'transition-all duration-200',
          data?.error ? 'ring-2 ring-red-300 ring-offset-2' : '',
        )}
      >
        <div className="p-3 flex items-center justify-between border-b border-slate-200 gap-8">
          <div className="flex items-center gap-2 text-primary">
            {beforeTitleContent && beforeTitleContent(id, 'trigger')}
            <div
              className={`size-6 rounded-full flex items-center justify-center`}
            >
              <IconComponent className="size-4" name={data.icon} />
            </div>
            <div>
              <p className="font-medium ">{data.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <NodeDropdownActions id={id} data={data} />
          </div>
        </div>
        <div className="p-3">
          <span className="text-xs text-accent-foreground ">
            {data.description}
          </span>

          <TriggerNodeContent data={data} />
        </div>

        <NodeOutputHandler
          nodeType="trigger"
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
