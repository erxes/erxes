import { automationCanvasViewState } from '@/automations/states/automationState';
import { useAtom } from 'jotai';

export const useAutomationCanvasViewOptions = () => {
  const [{ showGrid, showMiniMap }, setCanvasView] = useAtom(
    automationCanvasViewState,
  );

  return {
    showGrid,
    showMiniMap,
    toggleGrid: () =>
      setCanvasView((view) => ({ ...view, showGrid: !view.showGrid })),
    toggleMiniMap: () =>
      setCanvasView((view) => ({ ...view, showMiniMap: !view.showMiniMap })),
  };
};
