import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconChevronDown,
  IconChevronRight,
  IconGripVertical,
  IconTrash,
} from '@tabler/icons-react';
import { Button, cn, Collapsible } from 'erxes-ui';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type TAutomationRuleCardProps = {
  id: string;
  title: string;
  summary?: string;
  onRemove: () => void;
  children: ReactNode;
};

type TRuleAccordion = {
  openId: string | null;
  toggle: (id: string) => void;
};

const RuleAccordionContext = createContext<TRuleAccordion | null>(null);

// One rule open at a time: the first on load, then whichever was just added
const useRuleAccordion = (ids: string[]): TRuleAccordion => {
  const [openId, setOpenId] = useState<string | null>(ids[0] ?? null);
  const knownIds = useRef(ids);

  useEffect(() => {
    const added = ids.find((id) => !knownIds.current.includes(id));

    knownIds.current = ids;

    if (added) {
      setOpenId(added);
    }
  }, [ids]);

  return {
    openId,
    toggle: (id) => setOpenId((current) => (current === id ? null : id)),
  };
};

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
  const accordion = useRuleAccordion(ids);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));

    if (from >= 0 && to >= 0) {
      onReorder(from, to);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
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
}: TAutomationRuleCardProps) => {
  const accordion = useContext(RuleAccordionContext);
  const open = accordion ? accordion.openId === id : true;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <Collapsible
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      open={open}
      onOpenChange={() => accordion?.toggle(id)}
      className={cn(
        'rounded-lg border bg-muted/30',
        isDragging && 'relative z-10 opacity-70 shadow-lg',
      )}
    >
      <div className="flex items-center gap-1 px-3 py-2">
        <div
          {...attributes}
          {...listeners}
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
