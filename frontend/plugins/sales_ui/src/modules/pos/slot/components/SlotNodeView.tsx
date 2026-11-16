import { NodeResizer, type NodeProps } from '@xyflow/react';
import { cn } from 'erxes-ui';
import { SLOT_MIN_SIZE } from '@/pos/slot/constants';
import type { SlotNode } from '@/pos/slot/types';

export const SlotNodeView = ({ data, selected }: NodeProps<SlotNode>) => (
  <>
    <NodeResizer
      isVisible={selected}
      minWidth={SLOT_MIN_SIZE}
      minHeight={SLOT_MIN_SIZE}
      color="var(--primary)"
      handleClassName="size-2! rounded-sm! bg-background!"
    />
    <div
      className={cn(
        'flex size-full items-center justify-center overflow-hidden p-1 text-center text-xs font-medium text-white shadow-sm',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      )}
      style={{
        backgroundColor: data.color,
        borderRadius: data.rounded,
        transform: `rotate(${data.rotateAngle}deg)`,
      }}
    >
      <span className="line-clamp-2 [overflow-wrap:anywhere]">
        {data.name || data.code}
      </span>
    </div>
  </>
);
