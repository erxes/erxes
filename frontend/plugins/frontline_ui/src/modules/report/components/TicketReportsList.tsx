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
import { ScrollArea, Skeleton } from 'erxes-ui';
import {
  IconTicket,
  IconAlertOctagonFilled,
  IconAlertTriangleFilled,
  IconAlertCircleFilled,
  IconInfoCircleFilled,
  IconCircleDotFilled,
} from '@tabler/icons-react';
import { KpiCard } from '../call/components/KpiSection/KpiCard';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useTicketPriority } from '@/report/hooks/useTicketPriority';
import { ReportsViewSkeleton } from './ReportsView';
import {
  ticketReportComponents,
  TICKET_DEFAULT_CARD_CONFIGS,
  ReportCardConfig,
  ReportComponentProps,
} from '../types/component-registry';

interface CardConfig {
  id: string;
  colSpan: 6 | 12;
}

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
      className={`transition-colors ${colSpan === 6 ? 'col-span-6' : 'col-span-12'} ${
        isOver ? 'bg-accent/50 rounded-lg' : ''
      }`}
    >
      {children}
    </div>
  );
}

/** Map priority level (ascending severity) to a tabler icon. */
function PriorityIcon({ priority }: { priority: number }) {
  const icons = [
    <IconCircleDotFilled className="h-5 w-5" />, // 0 — no priority
    <IconInfoCircleFilled className="h-5 w-5" />, // 1 — low
    <IconAlertCircleFilled className="h-5 w-5" />, // 2 — medium
    <IconAlertTriangleFilled className="h-5 w-5" />, // 3 — high
    <IconAlertOctagonFilled className="h-5 w-5" />, // 4 — urgent / critical
  ];
  return icons[Math.min(priority, icons.length - 1)] ?? icons[0];
}

export const TicketReportsList = () => {
  const { priorityData, loading: priorityLoading } = useTicketPriority();

  const [cards, setCards] = useState<CardConfig[]>(
    TICKET_DEFAULT_CARD_CONFIGS.map((c) => ({ id: c.id, colSpan: c.colSpan })),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewColSpan, setPreviewColSpan] = useState<6 | 12>(6);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const modifiers = useMemo(() => [restrictToWindowEdges], []);

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(event.active.id as string);

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overCard = cards.find((c) => c.id === over.id);
      setPreviewColSpan(overCard?.colSpan === 6 ? 6 : 12);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const overCard = cards.find((c) => c.id === over.id);
      const overIndex = cards.findIndex((c) => c.id === over.id);
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const reordered = arrayMove(items, oldIndex, overIndex);
        return reordered.map((item) =>
          item.id === active.id
            ? { ...item, colSpan: (overCard?.colSpan === 6 ? 6 : 12) as 6 | 12 }
            : item,
        );
      });
    }
    setActiveId(null);
    setPreviewColSpan(12);
  };

  const handleColSpanChange = (id: string, colSpan: 6 | 12) => {
    setCards((items) =>
      items.map((item) => (item.id === id ? { ...item, colSpan } : item)),
    );
  };

  if (priorityLoading) return <ReportsViewSkeleton />;

  const totalCount = priorityData?.reduce((s, r) => s + r.count, 0) ?? 0;

  const getCardConfig = (id: string): ReportCardConfig | null => {
    const config = TICKET_DEFAULT_CARD_CONFIGS.find((c) => c.id === id);
    const Component = ticketReportComponents[id];
    if (!config || !Component) return null;
    return { ...config, component: Component };
  };

  const renderCard = (card: CardConfig, overrideColSpan?: 6 | 12) => {
    const { id, colSpan } = card;
    const cardConfig = getCardConfig(id);
    if (!cardConfig) return null;
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
          <div className={colSpan === 6 ? 'col-span-6' : 'col-span-12'}>
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <Component {...commonProps} />
      </Suspense>
    );
  };

  const activeCard = cards.find((c) => c.id === activeId);

  return (
    <div className="flex flex-col overflow-hidden h-full relative m-3 gap-3">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard
          title="Total Tickets"
          value={String(totalCount)}
          subtitle="All priorities"
          icon={<IconTicket className="h-5 w-5" />}
          valueClass="text-foreground"
          iconClass="bg-muted text-muted-foreground"
        />
        {priorityData?.map((p) => (
          <KpiCard
            key={p.priority}
            title={p.name}
            value={String(p.count)}
            subtitle={`${p.percentage}% of total`}
            icon={<PriorityIcon priority={p.priority} />}
            valueStyle={{ color: p.color }}
            iconStyle={{ backgroundColor: `${p.color}1a`, color: p.color }}
          />
        ))}
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
          <DragOverlay style={{ opacity: 0.95, cursor: 'grabbing' }}>
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
