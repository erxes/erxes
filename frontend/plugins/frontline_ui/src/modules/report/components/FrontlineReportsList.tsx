import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { useConversationClosed } from '@/report/hooks/useConversationClose';
import { useConversationOpen } from '@/report/hooks/useConversationOpen';
import { useConversationSources } from '@/report/hooks/useConversationSource';
import {
  IconInbox,
  IconCircleCheck,
  IconTrophyFilled,
  IconChartArcs,
} from '@tabler/icons-react';
import { KpiCard } from '../call/components/KpiSection/KpiCard';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ScrollArea, Skeleton } from 'erxes-ui';
import { Suspense, useMemo, useState } from 'react';
import {
  DEFAULT_CARD_CONFIGS,
  ReportCardConfig,
  ReportComponentProps,
  reportComponents,
} from '../types/component-registry';
import { getTopSource } from '../utils';
import { ReportsViewSkeleton } from './ReportsView';

interface CardConfig {
  id: string;
  colSpan: 6 | 12;
}

const INITIAL_CARDS: CardConfig[] = DEFAULT_CARD_CONFIGS.map((config) => ({
  id: config.id,
  colSpan: config.colSpan,
}));

interface DroppableAreaProps {
  id: string;
  colSpan: 6 | 12;
  children: React.ReactNode;
}

function DroppableArea({ id, colSpan, children }: DroppableAreaProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${
        colSpan === 6 ? 'col-span-6' : 'col-span-12'
      } ${isOver ? 'bg-accent/50 rounded-lg' : ''}`}
    >
      {children}
    </div>
  );
}

export const FrontlineReportsList = () => {
  const { conversationOpen, loading: openLoading } = useConversationOpen();
  const { conversationClosed, loading: closedLoading } =
    useConversationClosed();
  const { conversationSources = [], loading: sourcesLoading } =
    useConversationSources({
      variables: {
        filters: {
          limit: 10,
        },
      },
    });
  const [cards, setCards] = useState<CardConfig[]>(INITIAL_CARDS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [previewColSpan, setPreviewColSpan] = useState<6 | 12>(12);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const modifiers = useMemo(() => [restrictToWindowEdges], []);

  const sources = Array.isArray(conversationSources) ? conversationSources : [];
  const topPerformingSource = getTopSource(sources);
  const topConvertingSource = getTopSource(sources);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string | null);

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
    setOverId(null);
    setPreviewColSpan(12);
  };

  const activeCard = cards.find((c) => c.id === activeId);

  const handleColSpanChange = (id: string, colSpan: 6 | 12) => {
    setCards((items) =>
      items.map((item) => (item.id === id ? { ...item, colSpan } : item)),
    );
  };

  if (openLoading || closedLoading || sourcesLoading) {
    return <ReportsViewSkeleton />;
  }

  const getCardConfig = (id: string): ReportCardConfig | null => {
    const config = DEFAULT_CARD_CONFIGS.find((c) => c.id === id);
    const Component = reportComponents[id];

    if (!config || !Component) {
      return null;
    }

    return {
      ...config,
      component: Component,
    };
  };

  const renderCard = (card: CardConfig, overrideColSpan?: 6 | 12) => {
    const { id, colSpan } = card;
    const cardConfig = getCardConfig(id);

    if (!cardConfig) {
      return null;
    }

    const Component = cardConfig.component;
    const commonProps: ReportComponentProps = {
      title: cardConfig.title,
      colSpan: overrideColSpan ?? colSpan,
      onColSpanChange: (span: 6 | 12) => handleColSpanChange(id, span),
    };

    return (
      <Suspense
        key={id}
        fallback={
          <div className={`${colSpan === 6 ? 'col-span-6' : 'col-span-12'}`}>
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <Component {...commonProps} />
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col overflow-hidden h-full relative m-3 gap-3">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Open Conversations"
          value={String(conversationOpen?.count ?? 0)}
          subtitle={`${conversationOpen?.percentage ?? 0}% of total`}
          icon={<IconInbox className="h-5 w-5" />}
          valueClass="text-[var(--chart-1)]"
          iconClass="bg-[var(--chart-1)]/10 text-[var(--chart-1)]"
        />
        <KpiCard
          title="Closed Conversations"
          value={String(conversationClosed?.count ?? 0)}
          subtitle={`${conversationClosed?.percentage ?? 0}% resolved`}
          icon={<IconCircleCheck className="h-5 w-5" />}
          valueClass="text-[var(--pos)]"
          iconClass="bg-[var(--pos)]/10 text-[var(--pos)]"
        />
        <KpiCard
          title="Top Performing Source"
          value={String(topPerformingSource?.count ?? 0)}
          subtitle={
            INTEGRATIONS[topPerformingSource?._id as keyof typeof INTEGRATIONS]
              ?.name
              ? `${INTEGRATIONS[topPerformingSource._id as keyof typeof INTEGRATIONS].name} · ${topPerformingSource?.percentage ?? 0}%`
              : `${topPerformingSource?.percentage ?? 0}% share`
          }
          icon={<IconTrophyFilled className="h-5 w-5" />}
          valueClass="text-[var(--chart-2)]"
          iconClass="bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
        />
        <KpiCard
          title="Top Converting Source"
          value={String(topConvertingSource?.count ?? 0)}
          subtitle={
            INTEGRATIONS[topConvertingSource?._id as keyof typeof INTEGRATIONS]
              ?.name
              ? `${INTEGRATIONS[topConvertingSource._id as keyof typeof INTEGRATIONS].name} · ${topConvertingSource?.percentage ?? 0}%`
              : `${topConvertingSource?.percentage ?? 0}% share`
          }
          icon={<IconChartArcs className="h-5 w-5" />}
          valueClass="text-[var(--chart-3)]"
          iconClass="bg-[var(--chart-3)]/10 text-[var(--chart-3)]"
        />
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={modifiers}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-12 gap-3 p-1">
              {cards.map((card) => (
                <DroppableArea
                  key={card.id}
                  id={card.id}
                  colSpan={card.colSpan}
                >
                  {renderCard(card)}
                </DroppableArea>
              ))}
            </div>
          </SortableContext>
          <DragOverlay
            style={{
              opacity: 0.95,
              cursor: 'grabbing',
            }}
          >
            {activeCard ? (
              <div className="shadow-2xl border-2 border-primary/20 rounded-lg overflow-hidden">
                {renderCard(activeCard, previewColSpan)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
    </div>
  );
};
