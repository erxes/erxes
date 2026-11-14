import { DASHBOARD_MAX_ITEMS } from '@/home/dashboard/constants/dashboardGrid';
import { useDashboardLayout } from '@/home/dashboard/hooks/useDashboardLayout';
import { useDashboardWidgets } from '@/home/dashboard/hooks/useDashboardWidgets';
import {
  TDashboardItem,
  TDashboardWidgetConfig,
  TDashboardWidgetDefinition,
} from '@/home/dashboard/types/dashboardTypes';
import { toast, useConfirm } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type TGridPosition = Pick<TDashboardItem, 'x' | 'y' | 'w' | 'h'>;

type TDashboardContext = {
  items: TDashboardItem[];
  widgets: ReturnType<typeof useDashboardWidgets>;
  loading: boolean;
  saving: boolean;
  isCustomized: boolean;
  isEditing: boolean;
  canAddMore: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  finishEditing: () => Promise<void>;
  resetLayout: () => void;
  // Places the widget (at `position`, else below everything); one with a
  // settings form opens it, and cancelling that form takes the tile back.
  addWidget: (
    widget: TDashboardWidgetDefinition,
    position?: Pick<TDashboardItem, 'x' | 'y'>,
  ) => void;
  pendingConfig: {
    item: TDashboardItem;
    widget: TDashboardWidgetDefinition;
  } | null;
  submitPendingConfig: (config: TDashboardWidgetConfig) => void;
  cancelPendingConfig: () => void;
  // The catalog widget being dragged, so the grid can size its drop preview.
  draggingWidget: TDashboardWidgetDefinition | null;
  setDraggingWidget: (widget: TDashboardWidgetDefinition | null) => void;
  removeItem: (id: string) => void;
  updateConfig: (id: string, config: TDashboardWidgetConfig) => void;
  applyPositions: (positions: Map<string, TGridPosition>) => void;
};

const DashboardContext = createContext<TDashboardContext | null>(null);

const bottomOf = (items: TDashboardItem[]) =>
  items.reduce((max, { y, h }) => Math.max(max, y + h), 0);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });
  const { confirm } = useConfirm();
  const layout = useDashboardLayout();
  const widgets = useDashboardWidgets();
  const [draft, setDraft] = useState<TDashboardItem[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [draggingWidget, setDraggingWidget] =
    useState<TDashboardWidgetDefinition | null>(null);

  const isEditing = draft !== null;

  // Tiles whose widget is gone or no longer allowed simply don't render; the
  // saved layout keeps them in case access comes back.
  const items = useMemo(
    () =>
      (draft ?? layout.items).filter(({ type }) => widgets.byType.has(type)),
    [draft, layout.items, widgets.byType],
  );

  const pendingItem = items.find(({ id }) => id === pendingId);
  const pendingWidget = pendingItem && widgets.byType.get(pendingItem.type);

  const removeItem = (id: string) =>
    setDraft((current) =>
      (current ?? layout.items).filter((item) => item.id !== id),
    );

  const updateConfig = (id: string, config: TDashboardWidgetConfig) =>
    setDraft((current) =>
      (current ?? layout.items).map((item) =>
        item.id === id ? { ...item, config } : item,
      ),
    );

  const value: TDashboardContext = {
    items,
    widgets,
    loading: layout.loading,
    saving: layout.saving,
    isCustomized: layout.isCustomized,
    isEditing,
    canAddMore: items.length < DASHBOARD_MAX_ITEMS,
    startEditing: () => setDraft(layout.items),
    cancelEditing: () => {
      setPendingId(null);
      setDraft(null);
    },
    finishEditing: async () => {
      if (!draft) {
        return;
      }

      try {
        await layout.save(draft);
        setDraft(null);
        toast({ title: t('saved'), variant: 'success' });
      } catch (error) {
        toast({
          title: t('save-failed'),
          description: error instanceof Error ? error.message : undefined,
          variant: 'destructive',
        });
      }
    },
    resetLayout: () => {
      confirm({ message: t('reset-confirm') }).then(async () => {
        try {
          await layout.reset();
          setDraft(null);
          toast({ title: t('reset-done'), variant: 'success' });
        } catch (error) {
          toast({
            title: t('save-failed'),
            description: error instanceof Error ? error.message : undefined,
            variant: 'destructive',
          });
        }
      });
    },
    addWidget: (widget, position) => {
      const id = nanoid();

      setDraft((current) => {
        const list = current ?? layout.items;

        return [
          ...list,
          {
            id,
            type: widget.type,
            x: position?.x ?? 0,
            y: position?.y ?? bottomOf(list),
            w: widget.defaultSize.w,
            h: widget.defaultSize.h,
            config: null,
          },
        ];
      });

      if (widget.ConfigForm) {
        setPendingId(id);
      }
    },
    pendingConfig:
      pendingItem && pendingWidget
        ? { item: pendingItem, widget: pendingWidget }
        : null,
    submitPendingConfig: (config) => {
      if (pendingId) {
        updateConfig(pendingId, config);
      }

      setPendingId(null);
    },
    cancelPendingConfig: () => {
      if (pendingId) {
        removeItem(pendingId);
      }

      setPendingId(null);
    },
    draggingWidget,
    setDraggingWidget,
    removeItem,
    updateConfig,
    // Keeps the same array when nothing moved, so the grid's change event
    // can't feed itself through a re-render.
    applyPositions: (positions) =>
      setDraft((current) => {
        if (!current) {
          return current;
        }

        const moved = current.some((item) => {
          const position = positions.get(item.id);

          return (
            !!position &&
            (position.x !== item.x ||
              position.y !== item.y ||
              position.w !== item.w ||
              position.h !== item.h)
          );
        });

        return moved
          ? current.map((item) => ({ ...item, ...positions.get(item.id) }))
          : current;
      }),
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboard must be used inside DashboardProvider');
  }

  return context;
};
