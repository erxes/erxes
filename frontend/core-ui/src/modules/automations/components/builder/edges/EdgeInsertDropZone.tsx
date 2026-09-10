import {
  IconColumnInsertRight,
  IconRowInsertBottom,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

const InsertBadge = ({
  isActive,
  isVertical,
}: {
  isActive: boolean;
  isVertical: boolean;
}) => (
  <div
    className={cn(
      'pointer-events-none flex size-9 items-center justify-center rounded-full border border-dashed border-success/60 bg-background text-success shadow-sm transition-all duration-150',
      isActive && 'scale-125 border-solid bg-success/10 shadow-md',
    )}
  >
    {isVertical ? (
      <IconRowInsertBottom className="size-4" />
    ) : (
      <IconColumnInsertRight className="size-4" />
    )}
  </div>
);

const badgeMotionProps = {
  initial: { opacity: 0, scale: 0.7 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.7 },
  transition: { duration: 0.2 },
};

/** Shown while a canvas node is dragged over this edge, which is a pointer
 *  gesture and so never reaches a drop handler. */
export const EdgeInsertIndicator = ({
  isVertical,
}: {
  isVertical: boolean;
}) => (
  <motion.div
    {...badgeMotionProps}
    className="flex size-16 items-center justify-center"
  >
    <InsertBadge isActive isVertical={isVertical} />
  </motion.div>
);

/** Shown while a library entry is dragged, which is an HTML5 drag. */
export const EdgeInsertDropZone = ({
  isVertical,
  onInsert,
}: {
  isVertical: boolean;
  onInsert: (event: React.DragEvent<HTMLDivElement>) => void;
}) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <motion.div
      {...badgeMotionProps}
      // Without stopPropagation the canvas' own drop handler fires too and
      // appends a second, unconnected node.
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOver(false);
        onInsert(event);
      }}
      // The hit area is deliberately larger than the badge it draws.
      className="flex size-16 items-center justify-center"
    >
      <InsertBadge isActive={isOver} isVertical={isVertical} />
    </motion.div>
  );
};
