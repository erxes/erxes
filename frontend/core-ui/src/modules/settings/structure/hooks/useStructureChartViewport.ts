import { useReactFlow, useViewport } from '@xyflow/react';
import { STRUCTURE_CHART_FIT_VIEW_OPTIONS } from '../constants/structureChart';

const ANIMATION = { duration: 200 };

export const useStructureChartViewport = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  return {
    zoomPercent: Math.round(zoom * 100),
    zoomIn: () => zoomIn(ANIMATION),
    zoomOut: () => zoomOut(ANIMATION),
    fitView: () =>
      fitView({ ...STRUCTURE_CHART_FIT_VIEW_OPTIONS, ...ANIMATION }),
  };
};
