import { Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
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
import {
  IconArticle,
  IconMessage,
  IconMessage2Share,
  IconMessages,
  IconRobot,
} from '@tabler/icons-react';

import { KpiCard } from '../call/components/KpiSection/KpiCard';
import { OVERVIEW_KPI_DATE_FILTER_ID } from './filter-popover/ReportKpiDateFilter';
import {
  FACEBOOK_DEFAULT_CARD_CONFIGS,
  facebookReportComponents,
  ReportComponentProps,
} from '../types/component-registry';
import { useFacebookSummary } from '@/report/hooks/useFacebookReport';
import { useReportCharts } from '@/report/hooks/useReportCharts';
import { getReportDateFilterAtom } from '@/report/states';
import { ReportChart } from '@/report/types';
import { getFilters } from '@/report/utils/dateFilters';

interface CardConfig {
  id: string;
  colSpan: 6 | 12;
}

function DroppableArea({
  id,
  colSpan,
  children,
}: {
  id: string;
  colSpan: 6 | 12;
  children: React.ReactNode;
}) {
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

export const FacebookReportsList = () => {
  const { t } = useTranslation('frontline');
  const kpiDate = useAtomValue(
    getReportDateFilterAtom(OVERVIEW_KPI_DATE_FILTER_ID),
  );
  const kpiFilters = useMemo(() => getFilters(kpiDate || undefined), [kpiDate]);

  const {
    facebookSummary,
    loading: summaryLoading,
    error: summaryError,
  } = useFacebookSummary({ variables: { filters: kpiFilters } });

  const { reportCharts } = useReportCharts();
  const savedFacebookCharts = useMemo(
    () =>
      reportCharts.filter((chart) => facebookReportComponents[chart.chartType]),
    [reportCharts],
  );

  const [cards, setCards] = useState<CardConfig[]>(
    FACEBOOK_DEFAULT_CARD_CONFIGS.map((config) => ({
      id: config.id,
      colSpan: config.colSpan,
    })),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewColSpan, setPreviewColSpan] = useState<6 | 12>(6);

  const savedChartsById = useMemo(
    () => new Map(savedFacebookCharts.map((chart) => [chart._id, chart])),
    [savedFacebookCharts],
  );

  useEffect(() => {
    setCards((current) => {
      const isKnown = (id: string) =>
        savedChartsById.has(id) ||
        FACEBOOK_DEFAULT_CARD_CONFIGS.some((config) => config.id === id);

      const kept = current.filter((card) => isKnown(card.id));
      const onBoard = new Set(kept.map((card) => card.id));

      const added: CardConfig[] = savedFacebookCharts
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
  }, [savedFacebookCharts, savedChartsById]);

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
      const overCard = cards.find((card) => card.id === over.id);
      setPreviewColSpan(overCard?.colSpan === 6 ? 6 : 12);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const overCard = cards.find((card) => card.id === over.id);
      const overIndex = cards.findIndex((card) => card.id === over.id);

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

  const getCardConfig = (id: string) => {
    const savedChart: ReportChart | undefined = savedChartsById.get(id);

    if (savedChart) {
      const Component = facebookReportComponents[savedChart.chartType];
      if (!Component) return null;
      return { title: savedChart.name, component: Component, savedChart };
    }

    const config = FACEBOOK_DEFAULT_CARD_CONFIGS.find((c) => c.id === id);
    const Component = facebookReportComponents[id];
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

    if (!cardConfig) return null;

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
          <div className={colSpan === 6 ? 'col-span-6' : 'col-span-12'}>
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <Component {...commonProps} />
      </Suspense>
    );
  };

  const activeCard = cards.find((card) => card.id === activeId);
  const summary = facebookSummary;
  const messageShare =
    summary && summary.messages
      ? Math.round((summary.botMessages / summary.messages) * 100)
      : 0;

  return (
    <div className="flex flex-col overflow-hidden h-full relative m-3 gap-3">
      {summaryError && (
        <Alert variant="destructive">
          <Alert.Title>{t('error-loading-data')}</Alert.Title>
          <Alert.Description>{summaryError.message}</Alert.Description>
        </Alert>
      )}
      {!summaryError && summaryLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      )}
      <div
        className={
          summaryError || summaryLoading
            ? 'hidden'
            : 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3'
        }
      >
        <KpiCard
          title={t('facebook-conversations')}
          value={String(summary?.conversations ?? 0)}
          subtitle={t('facebook-bot-coverage', {
            percent: summary?.botCoverage ?? 0,
          })}
          icon={<IconMessages className="h-5 w-5" />}
          valueClass="text-[var(--chart-1)]"
          iconClass="bg-[var(--chart-1)]/10 text-[var(--chart-1)]"
        />
        <KpiCard
          title={t('facebook-messages')}
          value={String(summary?.messages ?? 0)}
          subtitle={t('facebook-message-split', {
            incoming: summary?.incomingMessages ?? 0,
            staff: summary?.staffMessages ?? 0,
          })}
          icon={<IconMessage className="h-5 w-5" />}
          valueClass="text-foreground"
        />
        <KpiCard
          title={t('facebook-bot-messages')}
          value={String(summary?.botMessages ?? 0)}
          subtitle={t('percent-of-total', { percent: messageShare })}
          icon={<IconRobot className="h-5 w-5" />}
          valueClass="text-[var(--chart-2)]"
          iconClass="bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
        />
        <KpiCard
          title={t('facebook-posts')}
          value={String(summary?.posts ?? 0)}
          subtitle={t('facebook-posts-subtitle')}
          icon={<IconArticle className="h-5 w-5" />}
          valueClass="text-foreground"
        />
        <KpiCard
          title={t('facebook-comments')}
          value={String(summary?.comments ?? 0)}
          subtitle={t('facebook-comments-subtitle')}
          icon={<IconMessage2Share className="h-5 w-5" />}
          valueClass="text-[var(--pos)]"
          iconClass="bg-[var(--pos)]/10 text-[var(--pos)]"
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
            items={cards.map((card) => card.id)}
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
