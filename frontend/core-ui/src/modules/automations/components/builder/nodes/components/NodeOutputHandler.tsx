import { TAutomationFlowDirection } from '@/automations/constants/flowDirection';
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
  flowDirection?: TAutomationFlowDirection;
}

type AwaitToConnectButtonProps = {
  nodeType: AutomationNodeType;
  addButtonClassName?: string;
  nodeHandleId: string;
  showButton: boolean;
  isVertical: boolean;
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

// React Flow 12.8.3+: children of a Handle positioned outside it still act as
// connection drag sources natively — no pointer forwarding needed.
const AwaitToConnectButton = memo(
  ({
    showButton,
    nodeType,
    addButtonClassName,
    nodeHandleId,
    isVertical,
  }: AwaitToConnectButtonProps) => {
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

    if (!showButton) return null;

    return (
      <div
        className={cn(
          'absolute flex pointer-events-none',
          isVertical
            ? 'left-1/2 top-1/2 -translate-x-1/2 flex-col items-center'
            : 'top-1/2 -translate-y-1/2 left-full items-center',
        )}
      >
        <div
          className={cn('bg-accent-foreground ', {
            'h-5 w-px mt-[7px]': isVertical,
            'h-px w-4': !isVertical,
          })}
        />
        {/* nodrag prevents node move; React Flow 12.8.3 still allows connection drag from Handle children */}
        <Button
          onClick={handleClick}
          size="sm"
          variant="outline"
          className={cn(
            'nodrag pointer-events-auto cursor-grab',
            addButtonClassName,
          )}
        >
          <AnimatePresence mode="wait">
            <AwaitToConnectButtonIcon
              isSelected={isSelected}
              nodeType={nodeType}
            />
          </AnimatePresence>
        </Button>
      </div>
    );
  },
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
        flowDirection = 'horizontal',
        onClick,
        children,
        ...props
      },
      ref,
    ) => {
      const isVertical = flowDirection === 'vertical';

      const nodeHandleId = `${nodeType}__${handlerId}`;

      return (
        <Handle
          key="right"
          id="right"
          type="source"
          ref={ref}
          position={isVertical ? Position.Bottom : Position.Right}
          {...props}
          className={cn('!size-4 -z-10', className)}
        >
          <AwaitToConnectButton
            addButtonClassName={addButtonClassName}
            nodeType={nodeType}
            nodeHandleId={nodeHandleId}
            showButton={showAddButton}
            isVertical={isVertical}
          />
          {children}
        </Handle>
      );
    },
  ),
);
