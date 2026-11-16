import {
  RuleAccordionContext,
  useAutomationRuleCard,
  useAutomationSortableRules,
} from '@/automations/components/builder/sidebar/hooks/useAutomationSortableRules';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  IconChevronDown,
  IconChevronRight,
  IconGripVertical,
  IconTrash,
} from '@tabler/icons-react';
import { Button, cn, Collapsible } from 'erxes-ui';
import { ReactNode } from 'react';

const VERTICAL_ONLY = [restrictToVerticalAxis];

// Ordered rules reorder by dragging a card's grip
export const AutomationSortableRules = ({
  ids,
  onReorder,
  children,
}: {
  ids: string[];
  onReorder: (from: number, to: number) => void;
  children: ReactNode;
}) => {
  const { accordion, sensors, handleDragEnd } = useAutomationSortableRules({
    ids,
    onReorder,
  });

  return (
    <DndContext
      sensors={sensors}
      modifiers={VERTICAL_ONLY}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <RuleAccordionContext.Provider value={accordion}>
          {children}
        </RuleAccordionContext.Provider>
      </SortableContext>
    </DndContext>
  );
};

// One ordered rule: collapsible, with its summary shown while closed
export const AutomationRuleCard = ({
  id,
  title,
  summary,
  onRemove,
  children,
}: {
  id: string;
  title: string;
  summary?: string;
  onRemove: () => void;
  children: ReactNode;
}) => {
  const { open, toggle, dragHandleProps, setNodeRef, style, isDragging } =
    useAutomationRuleCard(id);

  return (
    <Collapsible
      ref={setNodeRef}
      style={style}
      open={open}
      onOpenChange={toggle}
      className={cn(
        'rounded-lg border bg-muted/30',
        isDragging && 'relative z-10 opacity-70 shadow-lg',
      )}
    >
      <div className="flex items-center gap-1 px-3 py-2">
        <div
          {...dragHandleProps}
          title="Drag to reorder"
          className="flex flex-none cursor-grab items-center text-muted-foreground active:cursor-grabbing"
        >
          <IconGripVertical size={16} />
        </div>
        <Collapsible.Trigger asChild>
          <Button type="button" variant="ghost" size="icon">
            {open ? <IconChevronDown /> : <IconChevronRight />}
          </Button>
        </Collapsible.Trigger>
        <span className="shrink-0 text-sm font-medium">{title}</span>
        <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-muted-foreground">
          {!open && summary}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Remove rule"
          className="text-destructive"
          onClick={onRemove}
        >
          <IconTrash />
        </Button>
      </div>

      <Collapsible.Content className="flex flex-col gap-3 border-t p-3">
        {children}
      </Collapsible.Content>
    </Collapsible>
  );
};
