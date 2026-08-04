import { TDraggingNode } from '@/automations/components/builder/sidebar/states/automationNodeLibrary';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

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

type BuilderDnDMetaState = Pick<
  BuilderDnDState,
  'draggingNode' | 'hoveredRowId'
>;

type BuilderDnDOverlayState = Pick<BuilderDnDState, 'cursor' | 'isCanvasOver'>;

type BuilderDnDContextValue = {
  state: BuilderDnDState;
} & BuilderDnDActions;

type BuilderDnDActions = {
  setHoveredRowId: (id: string | null) => void;
  startDragging: (node: TDraggingNode) => void;
  updateCursor: (cursor: DragCursor | null) => void;
  setCanvasOver: (value: boolean) => void;
  reset: () => void;
};

const DnDStateContext = createContext<BuilderDnDState | null>(null);
const DnDMetaStateContext = createContext<BuilderDnDMetaState | null>(null);
const DnDOverlayStateContext = createContext<BuilderDnDOverlayState | null>(
  null,
);
const DnDActionsContext = createContext<BuilderDnDActions | null>(null);

export const AutomationBuilderDnDProvider = ({ children }: any) => {
  const [state, setState] = useState<BuilderDnDState>({
    draggingNode: null,
    hoveredRowId: null,
    cursor: null,
    isCanvasOver: false,
  });

  const setHoveredRowId = useCallback((hoveredRowId: string | null) => {
    setState((prev) =>
      prev.hoveredRowId === hoveredRowId ? prev : { ...prev, hoveredRowId },
    );
  }, []);

  const startDragging = useCallback((draggingNode: TDraggingNode) => {
    setState((prev) => ({ ...prev, draggingNode }));
  }, []);

  const updateCursor = useCallback((cursor: DragCursor | null) => {
    setState((prev) => {
      if (prev.cursor?.x === cursor?.x && prev.cursor?.y === cursor?.y) {
        return prev;
      }

      return { ...prev, cursor };
    });
  }, []);

  const setCanvasOver = useCallback((isCanvasOver: boolean) => {
    setState((prev) =>
      prev.isCanvasOver === isCanvasOver ? prev : { ...prev, isCanvasOver },
    );
  }, []);

  const reset = useCallback(() => {
    setState({
      draggingNode: null,
      hoveredRowId: null,
      cursor: null,
      isCanvasOver: false,
    });
  }, []);

  const actions = useMemo<BuilderDnDActions>(
    () => ({
      setHoveredRowId,
      startDragging,
      updateCursor,
      setCanvasOver,
      reset,
    }),
    [setHoveredRowId, startDragging, updateCursor, setCanvasOver, reset],
  );
  const metaState = useMemo<BuilderDnDMetaState>(
    () => ({
      draggingNode: state.draggingNode,
      hoveredRowId: state.hoveredRowId,
    }),
    [state.draggingNode, state.hoveredRowId],
  );
  const overlayState = useMemo<BuilderDnDOverlayState>(
    () => ({
      cursor: state.cursor,
      isCanvasOver: state.isCanvasOver,
    }),
    [state.cursor, state.isCanvasOver],
  );

  return (
    <DnDStateContext.Provider value={state}>
      <DnDMetaStateContext.Provider value={metaState}>
        <DnDOverlayStateContext.Provider value={overlayState}>
          <DnDActionsContext.Provider value={actions}>
            {children}
          </DnDActionsContext.Provider>
        </DnDOverlayStateContext.Provider>
      </DnDMetaStateContext.Provider>
    </DnDStateContext.Provider>
  );
};

export const useDnDState = () => {
  const state = useContext(DnDStateContext);

  if (!state) {
    throw new Error(
      'useDnDState must be used within AutomationBuilderDnDProvider',
    );
  }

  return state;
};

export const useDnDMetaState = () => {
  const state = useContext(DnDMetaStateContext);

  if (!state) {
    throw new Error(
      'useDnDMetaState must be used within AutomationBuilderDnDProvider',
    );
  }

  return state;
};

export const useDnDOverlayState = () => {
  const state = useContext(DnDOverlayStateContext);

  if (!state) {
    throw new Error(
      'useDnDOverlayState must be used within AutomationBuilderDnDProvider',
    );
  }

  return state;
};

export const useDnDActions = () => {
  const actions = useContext(DnDActionsContext);

  if (!actions) {
    throw new Error(
      'useDnDActions must be used within AutomationBuilderDnDProvider',
    );
  }

  return actions;
};

export const useDnD = () => {
  const state = useDnDState();
  const actions = useDnDActions();

  return { state, ...actions };
};
