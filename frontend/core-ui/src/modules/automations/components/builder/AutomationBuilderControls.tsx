import {
  IconBraces,
  IconFocusCentered,
  IconGridDots,
  IconMap,
  IconMenu2,
  IconMinus,
  IconPhoto,
  IconPlus,
  IconVectorBezier2,
} from '@tabler/icons-react';
import {
  Panel,
  getViewportForBounds,
  useOnViewportChange,
  useReactFlow,
} from '@xyflow/react';
import { Button, DropdownMenu, Separator, Tooltip, cn } from 'erxes-ui';
import { toPng, toSvg } from 'html-to-image';
import type React from 'react';
import { useState } from 'react';

const EXPORT_PADDING = 160;
const MIN_EXPORT_WIDTH = 800;
const MIN_EXPORT_HEIGHT = 600;
const CONTROL_BUTTON_CLASS =
  'size-7 rounded text-accent-foreground hover:bg-accent hover:text-foreground [&>svg]:size-4';
const ACTIVE_CONTROL_BUTTON_CLASS =
  'bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary';

const downloadDataUrl = (filename: string, dataUrl: string) => {
  const link = document.createElement('a');

  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const downloadJsonFile = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  downloadDataUrl(filename, url);
  URL.revokeObjectURL(url);
};

const getCurrentThemeBackgroundColor = () => {
  const bodyBackground = getComputedStyle(document.body).backgroundColor;

  if (bodyBackground && bodyBackground !== 'rgba(0, 0, 0, 0)') {
    return bodyBackground;
  }

  const isDarkTheme =
    document.documentElement.classList.contains('dark') ||
    getComputedStyle(document.documentElement).colorScheme === 'dark';

  return isDarkTheme ? '#20211f' : '#ffffff';
};

type AutomationBuilderControlsProps = {
  showGrid: boolean;
  showMiniMap: boolean;
  onToggleGrid: () => void;
  onToggleMiniMap: () => void;
};

export const AutomationBuilderControls = ({
  showGrid,
  showMiniMap,
  onToggleGrid,
  onToggleMiniMap,
}: AutomationBuilderControlsProps) => {
  const {
    fitView,
    getEdges,
    getNodes,
    getNodesBounds,
    getZoom,
    zoomIn,
    zoomOut,
  } = useReactFlow();
  const [zoom, setZoom] = useState(() => getZoom());

  useOnViewportChange({
    onChange: ({ zoom }) => setZoom(zoom),
  });

  const handleExportJson = () => {
    downloadJsonFile('automation-flow.json', {
      nodes: getNodes(),
      edges: getEdges(),
    });
  };

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

  const handleExportPng = async ({
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

  const handleExportSvg = async () => {
    const exportOptions = getExportOptions();

    if (!exportOptions) {
      return;
    }

    const dataUrl = await toSvg(exportOptions.viewport, exportOptions.options);

    downloadDataUrl('automation-flow.svg', dataUrl);
  };

  return (
    <Panel position="bottom-left" className="pointer-events-auto">
      <div className="flex w-10 flex-col items-center gap-0.5 rounded-md border bg-background/95 p-1 shadow-sm backdrop-blur">
        <ControlButton
          label="Fit canvas"
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
        >
          <IconFocusCentered />
        </ControlButton>

        <Separator className="w-full" />

        <ControlButton
          label="Zoom in"
          onClick={() => zoomIn({ duration: 200 })}
        >
          <IconPlus />
        </ControlButton>
        <div className="flex h-7 w-full items-center justify-center text-xs font-medium text-muted-foreground tabular-nums">
          {Math.round(zoom * 100)}%
        </div>
        <ControlButton
          label="Zoom out"
          onClick={() => zoomOut({ duration: 200 })}
        >
          <IconMinus />
        </ControlButton>

        <Separator className="w-full" />

        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Canvas options"
              className={CONTROL_BUTTON_CLASS}
            >
              <IconMenu2 className="size-4" />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="start" side="right" className="w-56">
            <DropdownMenu.Item onClick={onToggleMiniMap}>
              <IconMap className="size-4" />
              {showMiniMap ? 'Hide minimap' : 'Show minimap'}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={onToggleGrid}>
              <IconGridDots className="size-4" />
              {showGrid ? 'Hide grid' : 'Show grid'}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>
                <IconPhoto className="size-4" />
                Download PNG
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent className="w-48">
                <DropdownMenu.Item
                  onClick={() => handleExportPng({ withBackground: true })}
                >
                  With background
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => handleExportPng({ withBackground: false })}
                >
                  Transparent
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Item onClick={handleExportSvg}>
              <IconVectorBezier2 className="size-4" />
              Download SVG
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={handleExportJson}>
              <IconBraces className="size-4" />
              Export JSON
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    </Panel>
  );
};

const ControlButton = ({
  active = false,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={cn(
            CONTROL_BUTTON_CLASS,
            active && ACTIVE_CONTROL_BUTTON_CLASS,
          )}
        >
          {children}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  );
};
