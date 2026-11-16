import {
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type TRuleAccordion = {
  openId: string | null;
  toggle: (id: string) => void;
};

export const RuleAccordionContext = createContext<TRuleAccordion | null>(null);

const DRAG_ACTIVATION = { delay: 100, tolerance: 5 };

const firstNewId = (ids: string[], known: string[]) =>
  ids.find((id) => !known.includes(id));

// One rule open at a time: the first on load, then whichever was just added
const useRuleAccordion = (ids: string[]): TRuleAccordion => {
  const [openId, setOpenId] = useState<string | null>(ids[0] ?? null);
  const knownIds = useRef(ids);

  useEffect(() => {
    const added = firstNewId(ids, knownIds.current);

    knownIds.current = ids;

    if (added) {
      setOpenId(added);
    }
  }, [ids]);

  const toggle = useCallback(
    (id: string) => setOpenId((current) => (current === id ? null : id)),
    [],
  );

  return { openId, toggle };
};

/** Ordered rules: which one is open, and reordering by dragging a grip. */
export const useAutomationSortableRules = ({
  ids,
  onReorder,
}: {
  ids: string[];
  onReorder: (from: number, to: number) => void;
}) => {
  const accordion = useRuleAccordion(ids);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: DRAG_ACTIVATION }),
    useSensor(TouchSensor, { activationConstraint: DRAG_ACTIVATION }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) {
        return;
      }

      const from = ids.indexOf(String(active.id));
      const to = ids.indexOf(String(over.id));

      if (from >= 0 && to >= 0) {
        onReorder(from, to);
      }
    },
    [ids, onReorder],
  );

  return { accordion, sensors, handleDragEnd };
};

/** One rule card: open while it is the accordion's, and draggable. */
export const useAutomationRuleCard = (id: string) => {
  const accordion = useContext(RuleAccordionContext);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const toggle = useCallback(() => accordion?.toggle(id), [accordion, id]);

  return {
    open: accordion ? accordion.openId === id : true,
    toggle,
    dragHandleProps: { ...attributes, ...listeners },
    setNodeRef,
    style: { transform: CSS.Translate.toString(transform), transition },
    isDragging,
  };
};
