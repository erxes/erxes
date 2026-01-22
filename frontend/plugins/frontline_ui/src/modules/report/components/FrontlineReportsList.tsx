import { useState, useMemo, Suspense } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { getPluginAssetsUrl, Tooltip, Skeleton } from 'erxes-ui';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { InfoCard, ScrollArea } from 'erxes-ui';
import { useConversationOpen } from '@/report/hooks/useConversationOpen';
import { useConversationClosed } from '@/report/hooks/useConversationClose';
import { useConversationSources } from '@/report/hooks/useConversationSource';
import { ReportsViewSkeleton } from './ReportsView';
import { getTopSource } from '../utils';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import {
  reportComponents,
  DEFAULT_CARD_CONFIGS,
  ReportComponentProps,
  ReportCardConfig,
} from '../types/component-registry';

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
      <div className="grid grid-cols-4 gap-4">
        <InfoCard title="Open">
          <InfoCard.Content className="text-center">
            <div>
              {conversationOpen?.count} / {conversationOpen?.percentage}%
            </div>
          </InfoCard.Content>
        </InfoCard>
        <InfoCard title="Close">
          <InfoCard.Content className="text-center">
            <div>
              {conversationClosed?.count} / {conversationClosed?.percentage}%
            </div>
          </InfoCard.Content>
        </InfoCard>
        <InfoCard title="Top Performing Source">
          <InfoCard.Content className="flex flex-row items-center gap-2">
            <Tooltip>
              <Tooltip.Trigger>
                <img
                  src={getPluginAssetsUrl(
                    'frontline',
                    INTEGRATIONS[
                      topPerformingSource?._id as keyof typeof INTEGRATIONS
                    ]?.img,
                  )}
                  alt={topPerformingSource?._id}
                  className="size-5 object-contain cursor-help"
                />
              </Tooltip.Trigger>
              <Tooltip.Content>
                {
                  INTEGRATIONS[
                    topPerformingSource?._id as keyof typeof INTEGRATIONS
                  ]?.name
                }
              </Tooltip.Content>
            </Tooltip>
            <div className="text-center flex-1">
              {topPerformingSource?.count} / {topPerformingSource?.percentage}%
            </div>
          </InfoCard.Content>
        </InfoCard>
        <InfoCard title="Top Converting Source">
          <InfoCard.Content className="flex flex-row items-center gap-2">
            <Tooltip>
              <Tooltip.Trigger>
                <img
                  src={getPluginAssetsUrl(
                    'frontline',
                    INTEGRATIONS[
                      topConvertingSource?._id as keyof typeof INTEGRATIONS
                    ]?.img,
                  )}
                  alt={topConvertingSource?._id}
                  className="size-5 object-contain cursor-help"
                />
              </Tooltip.Trigger>
              <Tooltip.Content>
                {
                  INTEGRATIONS[
                    topConvertingSource?._id as keyof typeof INTEGRATIONS
                  ]?.name
                }
              </Tooltip.Content>
            </Tooltip>
            <div className="text-center flex-1">
              {topConvertingSource?.count} / {topConvertingSource?.percentage}%
            </div>
          </InfoCard.Content>
        </InfoCard>
      </div>
      <ScrollArea>
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
