import {
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_CARD_CONFIGS,
  reportComponents,
} from '../types/component-registry';
import { useReportCharts } from '@/report/hooks/useReportCharts';
import type {
  ConversationReportCard,
  ConversationReportLayout,
} from '@/report/types/conversationReportLayout';
const INITIAL_CARDS: ConversationReportCard[] = DEFAULT_CARD_CONFIGS.map(
  (config) => ({
    id: config.id,
    colSpan: config.colSpan,
  }),
);

export const useConversationReportLayout = (): ConversationReportLayout => {
  const { reportCharts } = useReportCharts();
  const savedConversationCharts = useMemo(
    () =>
      reportCharts.filter((chart) => reportComponents[chart.chartType ?? '']),
    [reportCharts],
  );
  const [cards, setCards] = useState<ConversationReportCard[]>(INITIAL_CARDS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewColSpan, setPreviewColSpan] = useState<6 | 12>(12);

  const savedChartsById = useMemo(
    () => new Map(savedConversationCharts.map((chart) => [chart._id, chart])),
    [savedConversationCharts],
  );

  useEffect(() => {
    setCards((current) => {
      const isKnown = (id: string) =>
        savedChartsById.has(id) ||
        DEFAULT_CARD_CONFIGS.some((config) => config.id === id);
      const kept = current.filter((card) => isKnown(card.id));
      const onBoard = new Set(kept.map((card) => card.id));
      const added: ConversationReportCard[] = savedConversationCharts
        .filter((chart) => !onBoard.has(chart._id))
        .map((chart) => ({
          id: chart._id,
          colSpan: chart.colSpan === 12 ? 12 : 6,
        }));

      if (!added.length && kept.length === current.length) {
        return current;
      }

      return [...kept, ...added];
    });
  }, [savedConversationCharts, savedChartsById]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const modifiers = useMemo(() => [restrictToWindowEdges], []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (over) {
      const overCard = cards.find((c) => c.id === over.id);
      if (overCard?.colSpan === 6) {
        setPreviewColSpan(6);
      } else {
        setPreviewColSpan(12);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const overCard = cards.find((c) => c.id === over.id);
      const overIndex = cards.findIndex((c) => c.id === over.id);

      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);

        if (overCard?.colSpan === 6) {
          const reordered = arrayMove(items, oldIndex, overIndex);
          return reordered.map((item) =>
            item.id === active.id ? { ...item, colSpan: 6 as const } : item,
          );
        }

        const reordered = arrayMove(items, oldIndex, overIndex);
        return reordered.map((item) =>
          item.id === active.id ? { ...item, colSpan: 12 as const } : item,
        );
      });
    }

    setActiveId(null);
    setPreviewColSpan(12);
  };

  const activeCard = cards.find((c) => c.id === activeId);

  const handleColSpanChange = (id: string, colSpan: 6 | 12) => {
    setCards((items) =>
      items.map((item) => (item.id === id ? { ...item, colSpan } : item)),
    );
  };

  return {
    cards,
    savedChartsById,
    sensors,
    modifiers,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleColSpanChange,
    activeCard,
    previewColSpan,
  };
};
