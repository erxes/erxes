import { Popover as PopoverPrimitive, Portal } from 'radix-ui';
import { Button } from 'erxes-ui';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useMemo, memo, useCallback, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { callWidgetPositionState } from '@/integrations/call/states/callWidgetStates';
import { callWidgetOpenAtom } from '@/integrations/call/states/callWidgetOpenAtom';

// Memoize draggable component
export const CallWidgetDraggable = memo(
  ({
    children,
    trigger,
    position,
  }: {
    children: React.ReactNode;
    trigger: React.ReactNode;
    position: { x: number; y: number };
  }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: 'call-widget',
    });
    const [open, setOpen] = useAtom(callWidgetOpenAtom);

    // Memoize style object to prevent recreating on every render
    const style = useMemo(
      () => ({
        transform: `translate(${position.x + (transform?.x ?? 0)}px, ${
          position.y + (transform?.y ?? 0)
        }px)`,
      }),
      [position.x, position.y, transform?.x, transform?.y],
    );

    return (
      <Portal.Root>
        <PopoverPrimitive.Trigger ref={setNodeRef} style={style} asChild>
          <Button
            variant="secondary"
            size="icon"
            className="fixed bottom-10 right-10 size-12 [&>svg]:size-6 rounded-full bg-background shadow-lg hover:bg-background"
            onClick={() => setOpen(!open)}
            {...listeners}
            {...attributes}
          >
            {trigger}
          </Button>
        </PopoverPrimitive.Trigger>

        {children}
      </Portal.Root>
    );
  },
);

CallWidgetDraggable.displayName = 'CallWidgetDraggable';

export const CallWidgetDraggableRoot = ({
  children,
  trigger,
}: {
  children: React.ReactNode;
  trigger: React.ReactNode;
}) => {
  const setOpen = useSetAtom(callWidgetOpenAtom);
  const [position, setPosition] = useAtom(callWidgetPositionState);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const checkPosition = useCallback((x: number, y: number) => {
    return {
      x: Math.min(40, Math.max((window.innerWidth - 88) * -1, x)),
      y: Math.min(40, Math.max((window.innerHeight - 88) * -1, y)),
    };
  }, []);

  // Memoize drag end handler to prevent recreating function
  const handleDragEnd = useCallback(
    (event: any) => {
      const { delta } = event;
      setPosition((prev) => checkPosition(prev.x + delta.x, prev.y + delta.y));
    },
    [setPosition, checkPosition],
  );

  //handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => checkPosition(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setPosition, checkPosition]);

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={() => setOpen(false)}
      sensors={sensors}
    >
      <CallWidgetDraggable position={position} trigger={trigger}>
        {children}
      </CallWidgetDraggable>
    </DndContext>
  );
};
