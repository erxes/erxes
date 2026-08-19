import { useOnViewportChange, useReactFlow } from '@xyflow/react';
import { useState } from 'react';

export const useAutomationCanvasZoom = () => {
  const { getZoom, zoomIn, zoomOut, zoomTo } = useReactFlow();
  const [zoom, setZoom] = useState(() => getZoom());

  useOnViewportChange({
    onChange: ({ zoom }) => setZoom(zoom),
  });

  return {
    zoomPercent: Math.round(zoom * 100),
    onZoomIn: () => zoomIn({ duration: 200 }),
    onZoomOut: () => zoomOut({ duration: 200 }),
    onZoomTo: (percent: number) => zoomTo(percent / 100),
  };
};
