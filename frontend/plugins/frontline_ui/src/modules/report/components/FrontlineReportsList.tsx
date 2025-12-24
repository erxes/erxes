import { useState } from 'react';
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
import { getPluginAssetsUrl, Skeleton, Tooltip } from 'erxes-ui';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { FrontlineReport } from './FrontlineReport';
import { InfoCard, ScrollArea } from 'erxes-ui';
import { useConversationOpen } from '@/report/hooks/useConversationOpen';
import { useConversationClosed } from '@/report/hooks/useConversationClose';
import { useConversationSources } from '@/report/hooks/useConversationSource';
import { ReportsViewSkeleton } from './ReportsView';
import { FrontlineReportBySource } from './FrontlineReportBySource';
import { getTopSource } from '../utils';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { FrontlineReportByTag } from './FrontlineReportByTag';
import { FrontlineReportByResponses } from './FrontlineReportByResponses';
import { FrontlineReportByList } from './FrontlineReportByList';
import { FrontlineReportOpen } from './FrontlineReportOpen';
import { FrontlineReportByResolved } from './FrontlineReportByResolved';

interface CardConfig {
  id: string;
  colSpan: 1 | 2;
}

const INITIAL_CARDS: CardConfig[] = [
  { id: 'conversation-open', colSpan: 2 },
  { id: 'conversation-resolved', colSpan: 2 },
  { id: 'conversation-source', colSpan: 1 },
  { id: 'conversation-tag', colSpan: 1 },
  { id: 'conversation-responses', colSpan: 2 },
  { id: 'conversation-list', colSpan: 2 },
];

interface DroppableAreaProps {
  id: string;
  colSpan: 1 | 2;
  children: React.ReactNode;
}

function DroppableArea({ id, colSpan, children }: DroppableAreaProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${
        colSpan === 2 ? 'col-span-2' : 'col-span-1'
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
  const [previewColSpan, setPreviewColSpan] = useState<1 | 2>(2);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sources = Array.isArray(conversationSources) ? conversationSources : [];
  const topPerformingSource = getTopSource(sources);
  const topConvertingSource = getTopSource(sources);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    console.log('event', event);
    const { over } = event;
    setOverId(over?.id as string | null);

    if (over) {
      const overCard = cards.find((c) => c.id === over.id);
      console.log('overCard', overCard?.colSpan);
      if (overCard?.colSpan === 1) {
        setPreviewColSpan(1);
      } else {
        setPreviewColSpan(2);
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

        if (overCard?.colSpan === 1) {
          const reordered = arrayMove(items, oldIndex, overIndex);
          return reordered.map((item) =>
            item.id === active.id ? { ...item, colSpan: 1 as const } : item,
          );
        }

        const reordered = arrayMove(items, oldIndex, overIndex);
        return reordered.map((item) =>
          item.id === active.id ? { ...item, colSpan: 2 as const } : item,
        );
      });
    }

    setActiveId(null);
    setOverId(null);
    setPreviewColSpan(2);
  };

  const activeCard = cards.find((c) => c.id === activeId);

  const handleColSpanChange = (id: string, colSpan: 1 | 2) => {
    setCards((items) =>
      items.map((item) => (item.id === id ? { ...item, colSpan } : item)),
    );
  };

  if (openLoading || closedLoading || sourcesLoading) {
    return <ReportsViewSkeleton />;
  }

  const renderCard = (card: CardConfig) => {
    const { id, colSpan } = card;
    const commonProps = {
      colSpan,
      onColSpanChange: (span: 1 | 2) => handleColSpanChange(id, span),
    };

    switch (id) {
      case 'conversation-open':
        return (
          <FrontlineReportOpen
            key={id}
            title="Conversation Open"
            {...commonProps}
          />
        );
      case 'conversation-resolved':
        return (
          <FrontlineReportByResolved
            key={id}
            title="Conversation Resolved"
            {...commonProps}
          />
        );
      case 'conversation-source':
        return (
          <FrontlineReportBySource
            key={id}
            title="Conversation Source"
            {...commonProps}
          />
        );
      case 'conversation-tag':
        return (
          <FrontlineReportByTag
            key={id}
            title="Conversation Tag"
            {...commonProps}
          />
        );
      case 'conversation-responses':
        return (
          <FrontlineReportByResponses
            key={id}
            title="Conversation Responses"
            {...commonProps}
          />
        );
      case 'conversation-list':
        return (
          <FrontlineReportByList
            key={id}
            title="Conversation List"
            {...commonProps}
          />
        );
      default:
        return null;
    }
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
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid xl:grid-cols-2 grid-cols-1 gap-3 p-1">
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
          <DragOverlay>
            {activeCard ? (
              <div
                className={`rounded-lg border bg-card transition-all ${
                  previewColSpan === 1 ? 'w-1/2' : 'w-full'
                }`}
              >
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
    </div>
  );
};
