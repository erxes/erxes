import { NodeOutputHandler } from '@/automations/components/builder/nodes/components/NodeOutputHandler';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { IconUsers } from '@tabler/icons-react';
import { memo } from 'react';

/** The campaign's audience, standing in for an automation's trigger. */
export const BROADCAST_START_NODE_ID = 'broadcast-start';

const BroadcastStartNode = ({ data, id }: { data: NodeData; id: string }) => (
  <div className="relative flex w-[280px] items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-primary">
    <IconUsers className="size-5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/70">
        Audience
      </p>
      <p className="truncate text-sm font-medium">{data.label}</p>
    </div>

    <NodeOutputHandler
      handlerId={id}
      nodeType={AutomationNodeType.Trigger}
      className="!bg-primary"
      addButtonClassName="hover:border-primary hover:text-primary"
      showAddButton={!data.actionId && !data.readOnly}
    />
  </div>
);

export default memo(BroadcastStartNode);
