import { TDraggingNode } from '@/automations/components/builder/sidebar/states/automationNodeLibrary';
import { createContext, useContext, useMemo, useState } from 'react';

type DragCursor = {
  x: number;
  y: number;
};

type BuilderDnDState = {
  draggingNode: TDraggingNode | null;
  hoveredRowId: string | null;
  cursor: DragCursor | null;
  isCanvasOver: boolean;
};

type BuilderDnDContextValue = {
  state: BuilderDnDState;
  setHoveredRowId: (id: string | null) => void;
  startDragging: (node: TDraggingNode) => void;
  updateCursor: (cursor: DragCursor | null) => void;
  setCanvasOver: (value: boolean) => void;
  reset: () => void;
};

const DnDContext = createContext<BuilderDnDContextValue | null>(null);

export const AutomationBuilderDnDProvider = ({ children }: any) => {
  const [state, setState] = useState<BuilderDnDState>({
    draggingNode: null,
    hoveredRowId: null,
    cursor: null,
    isCanvasOver: false,
  });

  const value = useMemo<BuilderDnDContextValue>(
    () => ({
      state,
      setHoveredRowId: (hoveredRowId) =>
        setState((prev) => ({ ...prev, hoveredRowId })),
      startDragging: (draggingNode) =>
        setState((prev) => ({ ...prev, draggingNode })),
      updateCursor: (cursor) => setState((prev) => ({ ...prev, cursor })),
      setCanvasOver: (isCanvasOver) =>
        setState((prev) => ({ ...prev, isCanvasOver })),
      reset: () =>
        setState({
          draggingNode: null,
          hoveredRowId: null,
          cursor: null,
          isCanvasOver: false,
        }),
    }),
    [state],
  );

  return <DnDContext.Provider value={value}>{children}</DnDContext.Provider>;
};

export const useDnD = () => {
  const context = useContext(DnDContext);

  if (!context) {
    throw new Error(
      'useDnD must be used within AutomationBuilderDnDProvider',
    );
  }

  return context;
};
