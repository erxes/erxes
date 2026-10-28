import { useReactFlow, useViewport } from '@xyflow/react';
import {
  STRUCTURE_CANVAS_ANIMATION,
  STRUCTURE_CANVAS_FIT_VIEW_OPTIONS,
} from '../constants/structureCanvas';

export const useStructureCanvasViewport = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  return {
    zoomPercent: Math.round(zoom * 100),
    zoomIn: () => zoomIn(STRUCTURE_CANVAS_ANIMATION),
    zoomOut: () => zoomOut(STRUCTURE_CANVAS_ANIMATION),
    fitView: () =>
      fitView({
        ...STRUCTURE_CANVAS_FIT_VIEW_OPTIONS,
        ...STRUCTURE_CANVAS_ANIMATION,
      }),
  };
};
