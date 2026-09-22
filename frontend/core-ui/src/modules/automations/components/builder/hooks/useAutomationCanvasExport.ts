import {
  downloadDataUrl,
  downloadJsonFile,
  EXPORT_PADDING,
  getCurrentThemeBackgroundColor,
  MIN_EXPORT_HEIGHT,
  MIN_EXPORT_WIDTH,
} from '@/automations/utils/automationBuilderUtils/canvasExport';
import { getViewportForBounds, useReactFlow } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';

export const useAutomationCanvasExport = () => {
  const { getEdges, getNodes, getNodesBounds } = useReactFlow();

  const getExportOptions = () => {
    const nodes = getNodes();
    const viewport = document.querySelector(
      '.react-flow__viewport',
    ) as HTMLElement | null;

    if (!nodes.length || !viewport) {
      return null;
    }

    const bounds = getNodesBounds(nodes);
    const width = Math.max(
      Math.ceil(bounds.width + EXPORT_PADDING),
      MIN_EXPORT_WIDTH,
    );
    const height = Math.max(
      Math.ceil(bounds.height + EXPORT_PADDING),
      MIN_EXPORT_HEIGHT,
    );
    const { x, y, zoom } = getViewportForBounds(
      bounds,
      width,
      height,
      0.5,
      2,
      0.1,
    );

    return {
      viewport,
      options: {
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        },
      },
    };
  };

  const onExportPng = async ({
    withBackground,
  }: {
    withBackground: boolean;
  }) => {
    const exportOptions = getExportOptions();

    if (!exportOptions) {
      return;
    }

    const dataUrl = await toPng(exportOptions.viewport, {
      ...exportOptions.options,
      pixelRatio: 2,
      backgroundColor: withBackground
        ? getCurrentThemeBackgroundColor()
        : undefined,
    });

    downloadDataUrl(
      withBackground
        ? 'automation-flow-with-background.png'
        : 'automation-flow-transparent.png',
      dataUrl,
    );
  };

  const onExportSvg = async () => {
    const exportOptions = getExportOptions();

    if (!exportOptions) {
      return;
    }

    const dataUrl = await toSvg(exportOptions.viewport, exportOptions.options);

    downloadDataUrl('automation-flow.svg', dataUrl);
  };

  const onExportJson = () => {
    downloadJsonFile('automation-flow.json', {
      nodes: getNodes(),
      edges: getEdges(),
    });
  };

  return { onExportPng, onExportSvg, onExportJson };
};
