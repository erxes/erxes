import { useConversationReportUpdates } from '@/report/hooks/useConversationReportUpdates';
import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ScrollArea } from 'erxes-ui';
import { useConversationReportLayout } from '@/report/hooks/useConversationReportLayout';
import { ConversationReportKpis } from './ConversationReportKpis';
import { ConversationReportChart } from './ConversationReportChart';
import { ConversationReportDropArea } from './ConversationReportDropArea';

export const FrontlineReportsList = () => {
  useConversationReportUpdates();
  const {
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
  } = useConversationReportLayout();
  return (
    <div className="flex flex-col overflow-hidden h-full relative m-3 gap-3">
      <ConversationReportKpis />
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
                <ConversationReportDropArea
                  key={card.id}
                  id={card.id}
                  colSpan={card.colSpan}
                >
                  <ConversationReportChart
                    card={card}
                    savedChart={savedChartsById.get(card.id)}
                    onColSpanChange={handleColSpanChange}
                  />
                </ConversationReportDropArea>
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
                <ConversationReportChart
                  card={activeCard}
                  savedChart={savedChartsById.get(activeCard.id)}
                  onColSpanChange={handleColSpanChange}
                  overrideColSpan={previewColSpan}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
    </div>
  );
};
