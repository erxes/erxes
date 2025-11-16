import { Handle, Position } from '@xyflow/react';

export const AutomationOptionalConnectHandle =
  (id: string, isAvailableOptionalConnect: boolean) =>
  ({ optionalId }: { optionalId: string }) => {
    if (!isAvailableOptionalConnect) {
      return <></>;
    }
    return (
      <Handle
        key={`${id}-${optionalId}-right`}
        id={`${id}-${optionalId}-right`}
        type="source"
        position={Position.Right}
        className={
          '!right-4 !size-4 !bg-background !border !border-2 !rounded-full !border-accent-foreground !z-4'
        }
        isConnectable
        title="optional-connect"
      />
    );
  };
