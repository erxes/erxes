import { TAutomationFlowDirection } from '@/automations/constants/flowDirection';
import { Handle, Position } from '@xyflow/react';

const HIDDEN_HANDLE_CLASS =
  '!size-0 !min-w-0 !min-h-0 !border-0 !bg-transparent opacity-0';

export const ReadOnlyNodeHandles = ({
  flowDirection,
}: {
  flowDirection?: TAutomationFlowDirection;
}) => {
  const isVertical = flowDirection === 'vertical';

  return (
    <>
      <Handle
        type="target"
        position={isVertical ? Position.Top : Position.Left}
        className={HIDDEN_HANDLE_CLASS}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={isVertical ? Position.Bottom : Position.Right}
        className={HIDDEN_HANDLE_CLASS}
        isConnectable={false}
      />
    </>
  );
};
