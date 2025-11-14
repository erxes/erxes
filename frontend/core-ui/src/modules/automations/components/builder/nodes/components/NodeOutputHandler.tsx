import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { IconGripVertical, IconLinkPlus, IconPlus } from '@tabler/icons-react';
import {
  ConnectionState,
  Handle,
  Position,
  useConnection,
} from '@xyflow/react';
import { Button, cn } from 'erxes-ui';
import { AnimatePresence, motion } from 'framer-motion';
import React, { memo, useCallback } from 'react';

interface NodeOutputHandlerProps extends React.HTMLAttributes<HTMLDivElement> {
  handlerId: string;
  nodeType: AutomationNodeType;
  showAddButton: boolean;
  addButtonClassName?: string;
}

type NodeOutputAwaitConnectionHandleProps = {
  nodeType: AutomationNodeType;
  addButtonClassName?: string;
  nodeHandleId: string;
  showButton: boolean;
  props: any;
};
const selector = (
  { inProgress, fromHandle }: ConnectionState,
  handleId: string,
) => {
  const [nodeId] = handleId.split('__');
  return fromHandle?.nodeId === nodeId && inProgress;
};

const AwaitToConnectButtonIcon = ({
  isSelected,
  nodeType,
}: {
  isSelected: boolean;
  nodeType: AutomationNodeType;
}) => {
  if (isSelected) {
    return (
      <motion.div
        key="link"
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        <IconLinkPlus
          className={cn('size-4 text-accent-foreground', {
            'text-primary': nodeType === AutomationNodeType.Trigger,
            'text-success': nodeType === AutomationNodeType.Action,
          })}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="plus"
      initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
      animate={{ opacity: 1, rotate: 0, scale: 1 }}
      exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
      transition={{ duration: 0.2 }}
    >
      <IconPlus className="size-4 text-accent-foreground" />
    </motion.div>
  );
};

const AwaitToConnectButton = memo(
  React.forwardRef<HTMLDivElement, NodeOutputAwaitConnectionHandleProps>(
    (
      { showButton, nodeType, addButtonClassName, nodeHandleId, props },
      ref,
    ) => {
      const {
        awaitingToConnectNodeId,
        setAwaitingToConnectNodeId,
        setQueryParams,
      } = useAutomation();

      const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          e.preventDefault();
          if (!awaitingToConnectNodeId) {
            setQueryParams({ activeNodeId: null });
          }
          setAwaitingToConnectNodeId(
            awaitingToConnectNodeId === nodeHandleId ? '' : nodeHandleId,
          );
        },
        [awaitingToConnectNodeId, nodeHandleId],
      );

      const isSelected = awaitingToConnectNodeId === nodeHandleId;

      if (!showButton) {
        return null;
      }

      return (
        <div className="absolute flex items-center top-1/2 -translate-y-1/2 translate-x-3 pointer-events-none ml-0.5">
          <div className="bg-accent-foreground h-px w-10 -z-1" />
          <div className="nodrag nopan pointer-events-auto relative group">
            {!isSelected && (
              <Handle
                key="right"
                id="right"
                type="source"
                ref={ref}
                position={Position.Right}
                {...props}
                className={cn(
                  '!h-6 !w-0 !shadow-sm !bg-background flex justify-end items-center opacity-0',
                  '!shadow-button-outline !hover:bg-accent !rounded absolute inset-0 z-0',
                  '!cursor-grab group-hover:!h-7 group-hover:!w-8 group-hover:opacity-100 transition-all duration-100 ease-in-out',
                )}
              >
                <IconGripVertical className="size-2 text-accent-foreground pointer-events-none" />
              </Handle>
            )}

            <Button
              onClick={handleClick}
              size="sm"
              variant="outline"
              {...props}
              className={cn('relative z-10', addButtonClassName)}
            >
              <AnimatePresence mode="wait">
                <AwaitToConnectButtonIcon
                  isSelected={isSelected}
                  nodeType={nodeType}
                />
              </AnimatePresence>
            </Button>
          </div>
        </div>
      );
    },
  ),
);

export const NodeOutputHandler = memo(
  React.forwardRef<HTMLDivElement, NodeOutputHandlerProps>(
    (
      {
        className,
        addButtonClassName,
        showAddButton,
        nodeType,
        handlerId,
        onClick,
        children,
        ...props
      },
      ref,
    ) => {
      const connectionInProgress = useConnection((connection) =>
        selector(connection, handlerId),
      );

      const nodeHandleId = `${nodeType}__${handlerId}`;

      return (
        <Handle
          key="right"
          id="right"
          type="source"
          ref={ref}
          position={Position.Right}
          {...props}
          className={cn('!size-4 -z-10', className)}
        >
          <AwaitToConnectButton
            addButtonClassName={addButtonClassName}
            nodeType={nodeType}
            nodeHandleId={nodeHandleId}
            showButton={!connectionInProgress && showAddButton}
            ref={ref}
            props={props}
          />
          {children}
        </Handle>
      );
    },
  ),
);
