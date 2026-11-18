import {
  Background,
  BackgroundVariant,
  Panel,
  ReactFlow,
  ViewportPortal,
  useReactFlow,
  useViewport,
  type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  IconFocusCentered,
  IconLayoutGrid,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import { Button, Separator, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  SLOT_CANVAS,
  SLOT_CANVAS_EXTENT,
  SLOT_SNAP_GRID,
} from '@/pos/slot/constants';
import { SlotNodeView } from '@/pos/slot/components/SlotNodeView';
import type { SlotNode } from '@/pos/slot/types';

const NODE_TYPES = { slot: SlotNodeView };
const FIT_VIEW_OPTIONS = { padding: 0.1 };

interface SlotCanvasProps {
  nodes: SlotNode[];
  onNodesChange: (changes: NodeChange<SlotNode>[]) => void;
  onAdd: () => void;
  onArrange: () => void;
}

const ToolButton = ({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
);

const CanvasFloor = () => (
  <ViewportPortal>
    <div
      className="pointer-events-none absolute left-0 top-0 rounded-sm border border-dashed border-muted-foreground/40 bg-background/70"
      style={{
        width: SLOT_CANVAS.WIDTH,
        height: SLOT_CANVAS.HEIGHT,
        zIndex: -1,
      }}
    />
  </ViewportPortal>
);

const SlotToolbar = ({
  count,
  onAdd,
  onArrange,
}: {
  count: number;
  onAdd: () => void;
  onArrange: () => void;
}) => {
  const { t } = useTranslation('sales');
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <>
      <Panel
        position="top-left"
        className="m-3! flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm"
      >
        <Button type="button" variant="ghost" onClick={onAdd}>
          <IconPlus />
          {t('add-slot')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={count < 2}
          onClick={() => {
            onArrange();
            requestAnimationFrame(() => fitView(FIT_VIEW_OPTIONS));
          }}
        >
          <IconLayoutGrid />
          {t('slots-arrange', 'Arrange')}
        </Button>
      </Panel>
      <Panel
        position="bottom-left"
        className="m-3! flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-sm"
      >
        <ToolButton
          label={t('slots-zoom-out', 'Zoom out')}
          onClick={() => zoomOut()}
        >
          <IconMinus />
        </ToolButton>
        <span className="w-11 text-center text-xs tabular-nums text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <ToolButton
          label={t('slots-zoom-in', 'Zoom in')}
          onClick={() => zoomIn()}
        >
          <IconPlus />
        </ToolButton>
        <Separator orientation="vertical" className="mx-0.5 h-4" />
        <ToolButton
          label={t('slots-fit-view', 'Fit to screen')}
          onClick={() => fitView(FIT_VIEW_OPTIONS)}
        >
          <IconFocusCentered />
        </ToolButton>
      </Panel>
    </>
  );
};

export const SlotCanvas = ({
  nodes,
  onNodesChange,
  onAdd,
  onArrange,
}: SlotCanvasProps) => {
  const { t } = useTranslation('sales');

  return (
    <ReactFlow<SlotNode>
      nodes={nodes}
      onNodesChange={onNodesChange}
      nodeTypes={NODE_TYPES}
      nodeExtent={SLOT_CANVAS_EXTENT}
      snapToGrid
      snapGrid={SLOT_SNAP_GRID}
      nodesConnectable={false}
      deleteKeyCode={['Backspace', 'Delete']}
      minZoom={0.2}
      maxZoom={3}
      fitView
      fitViewOptions={FIT_VIEW_OPTIONS}
      proOptions={{ hideAttribution: true }}
      className="bg-muted/40"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <CanvasFloor />
      <Tooltip.Provider>
        <SlotToolbar count={nodes.length} onAdd={onAdd} onArrange={onArrange} />
      </Tooltip.Provider>
      {nodes.length === 0 && (
        <Panel
          position="top-center"
          className="top-1/2! -translate-y-1/2 flex flex-col items-center gap-3 rounded-lg border bg-background px-8 py-6 text-center shadow-sm"
        >
          <p className="text-sm text-muted-foreground">
            {t('no-slots-available')}
          </p>
          <Button type="button" onClick={onAdd}>
            <IconPlus />
            {t('add-your-first-slot')}
          </Button>
        </Panel>
      )}
    </ReactFlow>
  );
};
