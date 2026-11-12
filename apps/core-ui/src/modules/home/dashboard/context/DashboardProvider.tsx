import { toast, useConfirm } from 'erxes-ui';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_MAX_ITEMS } from '../constants/dashboardGrid';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import type { TDashboardItem, TDashboardWidgetDefinition } from '../types/dashboardTypes';
import {
  bottomOf,
  compactLayout,
  fitToWidget,
  newTileId,
  sameLayout,
} from '../utils/dashboardLayout';
import { DASHBOARD_WIDGETS, DASHBOARD_WIDGETS_BY_TYPE } from '../widgets/homeWidgets';

type TDashboardContext = {
  items: TDashboardItem[];
  widgets: {
    available: TDashboardWidgetDefinition[];
    byType: Map<string, TDashboardWidgetDefinition>;
  };
  isCustomized: boolean;
  isEditing: boolean;
  canAddMore: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  finishEditing: () => void;
  resetLayout: () => void;
  // Places the widget at `position`, else below everything.
  addWidget: (
    widget: TDashboardWidgetDefinition,
    position?: Pick<TDashboardItem, 'x' | 'y'>,
  ) => void;
  // The catalog widget being dragged, so the grid can size its drop preview.
  draggingWidget: TDashboardWidgetDefinition | null;
  setDraggingWidget: (widget: TDashboardWidgetDefinition | null) => void;
  removeItem: (id: string) => void;
  // The grid's moved / resized tiles while editing.
  setDraftItems: (items: TDashboardItem[]) => void;
};

const DashboardContext = createContext<TDashboardContext | null>(null);

const WIDGETS = { available: DASHBOARD_WIDGETS, byType: DASHBOARD_WIDGETS_BY_TYPE };

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });
  const { confirm } = useConfirm();
  const layout = useDashboardLayout();
  const [draft, setDraft] = useState<TDashboardItem[] | null>(null);
  const [draggingWidget, setDraggingWidget] = useState<TDashboardWidgetDefinition | null>(null);

  const isEditing = draft !== null;

  // Tiles whose widget is gone simply don't render; the saved layout keeps them.
  const items = useMemo(
    () => (draft ?? layout.items).filter(({ type }) => WIDGETS.byType.has(type)),
    [draft, layout.items],
  );

  const value: TDashboardContext = {
    items,
    widgets: WIDGETS,
    isCustomized: layout.isCustomized,
    isEditing,
    canAddMore: items.length < DASHBOARD_MAX_ITEMS,
    startEditing: () => setDraft(layout.items),
    cancelEditing: () => setDraft(null),
    finishEditing: () => {
      if (!draft) {
        return;
      }

      try {
        layout.save(draft);
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
      void confirm({ message: t('reset-confirm') }).then(() => {
        layout.reset();
        setDraft(null);
        toast({ title: t('reset-done'), variant: 'success' });
      });
    },
    addWidget: (widget, position) => {
      const id = newTileId();

      setDraft((current) => {
        const list = current ?? layout.items;

        const item = fitToWidget(
          {
            id,
            type: widget.type,
            x: position?.x ?? 0,
            y: position?.y ?? bottomOf(list),
            w: widget.defaultSize.w,
            h: widget.defaultSize.h,
          },
          widget,
        );

        return compactLayout([...list, item], id);
      });
    },
    draggingWidget,
    setDraggingWidget,
    removeItem: (id) =>
      setDraft((current) =>
        compactLayout((current ?? layout.items).filter((item) => item.id !== id)),
      ),
    setDraftItems: (next) =>
      setDraft((current) => (current && sameLayout(current, next) ? current : next)),
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboard must be used inside DashboardProvider');
  }

  return context;
};
