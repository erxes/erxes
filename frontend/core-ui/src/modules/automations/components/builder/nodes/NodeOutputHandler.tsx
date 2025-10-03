import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { IconLinkPlus, IconPlus } from '@tabler/icons-react';
import { Handle, Position } from '@xyflow/react';
import { Button, cn } from 'erxes-ui';
import { AnimatePresence, motion } from 'framer-motion';
import React, { memo, useCallback } from 'react';

interface NodeOutputHandlerProps extends React.HTMLAttributes<HTMLDivElement> {
  handlerId: string;
  nodeType: AutomationNodeType;
  showAddButton: boolean;
  addButtonClassName?: string;
}

const AwaitToConnectButton = memo(
  ({
    nodeType,
    nodeHandleId,
    addButtonClassName,
  }: {
    nodeType: AutomationNodeType;
    addButtonClassName?: string;
    nodeHandleId: string;
  }) => {
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

    const IconComponent = (
      <AnimatePresence mode="wait">
        {isSelected ? (
          <motion.div
            key="link"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <IconLinkPlus
              className={cn('size-4', {
                'text-primary': nodeType === 'trigger',
                'text-success': nodeType === 'action',
              })}
            />
          </motion.div>
        ) : (
          <motion.div
            key="plus"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <IconPlus className="size-4" />
          </motion.div>
        )}
      </AnimatePresence>
    );
    return (
      <div className="absolute flex items-center top-1/2 -translate-y-1/2 translate-x-4 pointer-events-none">
        <div className="bg-accent-foreground h-px w-10 -z-1" />
        <div className="nodrag nopan pointer-events-auto">
          <Button
            onClick={handleClick}
            size="sm"
            variant="outline"
            className={cn(addButtonClassName)}
          >
            {IconComponent}
          </Button>
        </div>
      </div>
    );
  },
);

export const NodeOutputHandler = memo(
  React.forwardRef<HTMLDivElement, NodeOutputHandlerProps>(
    function NodeOutputHandler(props, ref) {
      const {
        className,
        addButtonClassName,
        showAddButton,
        nodeType,
        handlerId,
        onClick,
        children,
        ...rest
      } = props;

      const nodeHandleId = `${nodeType}__${handlerId}`;

      return (
        <Handle
          key="right"
          id="right"
          type="source"
          position={Position.Right}
          className={cn('!size-4 -z-10', className)}
          {...rest}
        >
          {showAddButton && (
            <AwaitToConnectButton
              addButtonClassName={addButtonClassName}
              nodeType={nodeType}
              nodeHandleId={nodeHandleId}
            />
          )}
          {children}
        </Handle>
      );
    },
  ),
);
