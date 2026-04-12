import { TDraggingNode } from '@/automations/components/builder/sidebar/states/automationNodeLibrary';
import { useDnD } from '@/automations/context/AutomationBuilderDnDProvider';
import { AutomationNodeType } from '@/automations/types';
import { IconPlus } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconComponent, cn } from 'erxes-ui';

const getDraggingNodeMeta = (draggingNode: TDraggingNode) => {
  if ('label' in draggingNode) {
    return {
      label: draggingNode.label,
      icon: draggingNode.icon,
      kind: draggingNode.nodeType,
    };
  }

  return {
    label: draggingNode.name,
    icon: '',
    kind: draggingNode.nodeType,
  };
};

export const AutomationBuilderCanvasDragOverlay = () => {
  const {
    state: { draggingNode, cursor, isCanvasOver },
  } = useDnD();

  if (!draggingNode) {
    return null;
  }

  const { label, icon, kind } = getDraggingNodeMeta(draggingNode);
  const isTrigger = kind === AutomationNodeType.Trigger;
  const accentClassName = isTrigger ? 'text-primary' : 'text-success';
  const accentBgClassName = isTrigger ? 'bg-primary/10' : 'bg-success/10';
  const accentBorderClassName = isTrigger
    ? 'border-primary/20'
    : 'border-success/20';

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <AnimatePresence>
          <motion.div
            key="drop-zone"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{
              opacity: isCanvasOver ? 1 : 0.45,
              scale: isCanvasOver ? 1 : 0.97,
            }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'rounded-2xl border border-dashed bg-background/85 px-6 py-5 shadow-xl backdrop-blur-sm',
              accentBorderClassName,
            )}
          >
            <motion.div
              animate={
                isCanvasOver
                  ? { scale: [1, 1.03, 1], opacity: [0.9, 1, 0.9] }
                  : { scale: 1, opacity: 1 }
              }
              transition={{
                duration: 1.2,
                repeat: isCanvasOver ? Infinity : 0,
                ease: 'easeInOut',
              }}
              className="flex items-center gap-3"
            >
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl',
                  accentBgClassName,
                  accentClassName,
                )}
              >
                {icon ? (
                  <IconComponent name={icon} />
                ) : (
                  <IconPlus className="size-4" />
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {kind}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {isCanvasOver ? 'Drop to add node' : `Dragging ${label}`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {cursor && (
          <motion.div
            key="drag-chip"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: cursor.x + 18,
              y: cursor.y - 18,
            }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 460, damping: 32 }}
            className="pointer-events-none fixed z-30"
          >
            <div className="flex items-center gap-3 rounded-xl border bg-background/95 px-3 py-2 shadow-2xl backdrop-blur-sm">
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-lg',
                  accentBgClassName,
                  accentClassName,
                )}
              >
                {icon ? (
                  <IconComponent name={icon} />
                ) : (
                  <IconPlus className="size-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {kind}
                </p>
                <p className="max-w-52 truncate text-sm font-semibold text-foreground">
                  {label}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
