import { Handle, Position } from '@xyflow/react';

export const AutomationOptionalConnectHandle =
  (
    id: string,
    isAvailableOptionalConnect: boolean,
    flowDirection: 'horizontal' | 'vertical' = 'horizontal',
  ) =>
  ({ optionalId }: { optionalId: string }) => {
    if (!isAvailableOptionalConnect) {
      return <></>;
    }
    const isVertical = flowDirection === 'vertical';

    return (
      <Handle
        key={`${id}-${optionalId}-right`}
        id={`${id}-${optionalId}-right`}
        type="source"
        position={isVertical ? Position.Bottom : Position.Right}
        className={`!size-4 !bg-background !border !border-2 !rounded-full !border-accent-foreground !z-4 ${
          isVertical ? '!bottom-0 !left-1/2 !right-auto' : '!right-4'
        }`}
        isConnectable
        title="optional-connect"
      />
    );
  };
