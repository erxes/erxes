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
import { Alert, ScrollArea, Skeleton } from 'erxes-ui';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_CARD_CONFIGS,
  ReportComponentProps,
  reportComponents,
} from '../types/component-registry';
import { getTopSource } from '../utils';
import { useReportCharts } from '@/report/hooks/useReportCharts';
import { ReportChart } from '@/report/types';
import { useAtomValue } from 'jotai';
import { getReportDateFilterAtom } from '@/report/states';
import { getFilters } from '@/report/utils/dateFilters';
import { OVERVIEW_KPI_DATE_FILTER_ID } from './filter-popover/ReportKpiDateFilter';

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
  const { t } = useTranslation('frontline');
  const kpiDate = useAtomValue(
    getReportDateFilterAtom(OVERVIEW_KPI_DATE_FILTER_ID),
  );
  const kpiFilters = useMemo(() => getFilters(kpiDate || undefined), [kpiDate]);
  const {
    conversationOpen,
    loading: openLoading,
    error: openError,
  } = useConversationOpen({
    variables: { filters: kpiFilters },
  });
  const {
    conversationClosed,
    loading: closedLoading,
    error: closedError,
  } = useConversationClosed({
    variables: { filters: kpiFilters },
  });
  const {
    conversationSources = [],
    loading: sourcesLoading,
    error: sourcesError,
  } = useConversationSources({
    variables: {
      filters: {
        ...kpiFilters,
        limit: 10,
      },
    },
  });
  const { reportCharts } = useReportCharts();
  const savedConversationCharts = useMemo(
    () => reportCharts.filter((chart) => reportComponents[chart.chartType]),
    [reportCharts],
  );
  const [cards, setCards] = useState<CardConfig[]>(INITIAL_CARDS);
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
      const added: CardConfig[] = savedConversationCharts
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

  const sources = Array.isArray(conversationSources) ? conversationSources : [];
  const topPerformingSource = getTopSource(sources);
  const topConvertingSource = getTopSource(sources);
  const kpiError = openError || closedError || sourcesError;
  const kpiLoading = openLoading || closedLoading || sourcesLoading;

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

  const getCardConfig = (id: string) => {
    const savedChart: ReportChart | undefined = savedChartsById.get(id);

    if (savedChart) {
      const Component = reportComponents[savedChart.chartType];
      if (!Component) return null;
      return { title: savedChart.name, component: Component, savedChart };
    }

    const config = DEFAULT_CARD_CONFIGS.find((c) => c.id === id);
    const Component = reportComponents[id];
    if (!config || !Component) return null;
    return {
      title: t(config.title),
      component: Component,
      savedChart: undefined,
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
      cardId: id,
      savedChart: cardConfig.savedChart,
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
      {kpiError && (
        <Alert variant="destructive">
          <Alert.Title>{t('error-loading-data')}</Alert.Title>
          <Alert.Description>{kpiError.message}</Alert.Description>
        </Alert>
      )}
      {!kpiError && kpiLoading && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      )}
      <div
        className={
          kpiError || kpiLoading
            ? 'hidden'
            : 'grid grid-cols-2 xl:grid-cols-4 gap-4'
        }
      >
        <KpiCard
          title={t('open-conversations')}
          value={String(conversationOpen?.count ?? 0)}
          subtitle={t('percent-of-total', {
            percent: conversationOpen?.percentage ?? 0,
          })}
          icon={<IconInbox className="h-5 w-5" />}
          valueClass="text-[var(--chart-1)]"
          iconClass="bg-[var(--chart-1)]/10 text-[var(--chart-1)]"
        />
        <KpiCard
          title={t('closed-conversations')}
          value={String(conversationClosed?.count ?? 0)}
          subtitle={t('percent-resolved', {
            percent: conversationClosed?.percentage ?? 0,
          })}
          icon={<IconCircleCheck className="h-5 w-5" />}
          valueClass="text-[var(--pos)]"
          iconClass="bg-[var(--pos)]/10 text-[var(--pos)]"
        />
        <KpiCard
          title={t('top-performing-source')}
          value={String(topPerformingSource?.count ?? 0)}
          subtitle={
            INTEGRATIONS[topPerformingSource?._id as keyof typeof INTEGRATIONS]
              ?.name
              ? t('source-name-percent', {
                  name: INTEGRATIONS[
                    topPerformingSource._id as keyof typeof INTEGRATIONS
                  ].name,
                  percent: topPerformingSource?.percentage ?? 0,
                })
              : t('percent-share', {
                  percent: topPerformingSource?.percentage ?? 0,
                })
          }
          icon={<IconTrophyFilled className="h-5 w-5" />}
          valueClass="text-[var(--chart-2)]"
          iconClass="bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
        />
        <KpiCard
          title={t('top-converting-source')}
          value={String(topConvertingSource?.count ?? 0)}
          subtitle={
            INTEGRATIONS[topConvertingSource?._id as keyof typeof INTEGRATIONS]
              ?.name
              ? t('source-name-percent', {
                  name: INTEGRATIONS[
                    topConvertingSource._id as keyof typeof INTEGRATIONS
                  ].name,
                  percent: topConvertingSource?.percentage ?? 0,
                })
              : t('percent-share', {
                  percent: topConvertingSource?.percentage ?? 0,
                })
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
