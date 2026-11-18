import { IconMinus, IconPlus } from '@tabler/icons-react';
import {
  Background,
  BaseEdge,
  type Edge,
  type EdgeProps,
  getSmoothStepPath,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
} from '@xyflow/react';
import { Button, themeState, Tooltip } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DraftCard, MoreCard, UnitCard } from './ChartCards';
import { ANIMATION, FIRST_FIT, useChartFocus } from './chartFocus';
import { layoutChart, STACK_INDENT, V_GAP } from './chartLayout';
import { useWorkspace } from './context';

const CORNER = 8;

type Point = { x: number; y: number };

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const towards = (from: Point, to: Point, length: number): Point => {
  const total = distance(from, to) || 1;

  return {
    x: from.x + ((to.x - from.x) * length) / total,
    y: from.y + ((to.y - from.y) * length) / total,
  };
};

/** A polyline with rounded corners. */
const roundedPath = (points: Point[]) =>
  points.reduce((path, point, i) => {
    const previous = points[i - 1];
    const next = points[i + 1];

    if (!previous) return `M ${point.x} ${point.y}`;

    if (!next) return `${path} L ${point.x} ${point.y}`;

    const radius = Math.min(CORNER, distance(previous, point) / 2, distance(point, next) / 2);
    const start = towards(point, previous, radius);
    const end = towards(point, next, radius);

    return `${path} L ${start.x} ${start.y} Q ${point.x} ${point.y} ${end.x} ${end.y}`;
  }, '');

/** Elbow connectors; stacked children hang off one vertical trunk. */
const OrgEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<Edge<{ stacked: boolean }, 'org'>>) => {
  if (!data?.stacked) {
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: CORNER,
    });

    return <BaseEdge id={id} path={path} />;
  }

  const busY = sourceY + V_GAP / 2;
  const trunkX = targetX - STACK_INDENT / 2;

  return (
    <BaseEdge
      id={id}
      path={roundedPath([
        { x: sourceX, y: sourceY },
        { x: sourceX, y: busY },
        { x: trunkX, y: busY },
        { x: trunkX, y: targetY },
        { x: targetX, y: targetY },
      ])}
    />
  );
};

const ControlButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) => (
  <Tooltip>
    <Tooltip.Trigger
      render={<Button variant="ghost" size="icon" aria-label={label} onClick={onClick} />}
    >
      {children}
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
);

const ZoomControls = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <Panel position="bottom-left">
      <Tooltip.Provider>
        <div className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-sm">
          <ControlButton label={t('zoom-out', 'Zoom out')} onClick={() => void zoomOut(ANIMATION)}>
            <IconMinus />
          </ControlButton>
          <span className="min-w-11 text-center text-xs tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <ControlButton label={t('zoom-in', 'Zoom in')} onClick={() => void zoomIn(ANIMATION)}>
            <IconPlus />
          </ControlButton>
        </div>
      </Tooltip.Provider>
    </Panel>
  );
};

const NODE_TYPES = { card: UnitCard, more: MoreCard, draft: DraftCard };
const EDGE_TYPES = { org: OrgEdge };

const Chart = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const theme = useAtomValue(themeState);
  const { index, isOpen, draftParentId, select, selectedId, closeDraft } = useWorkspace();
  const [ready, setReady] = useState(false);
  const { nodes, edges } = layoutChart(index, isOpen, draftParentId);

  useChartFocus(nodes, ready);

  return (
    <ReactFlow
      className="org-flow"
      aria-label={t('chart-label', 'Organisation chart')}
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      colorMode={theme}
      minZoom={0.1}
      onInit={(instance) => {
        void instance.fitView(FIRST_FIT);
        setReady(true);
      }}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      deleteKeyCode={null}
      onPaneClick={() => {
        if (draftParentId) closeDraft();
        else if (selectedId) select(null);
      }}
      onlyRenderVisibleElements
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={16} />
      <ZoomControls />
    </ReactFlow>
  );
};

/** The structure as an org chart: the organisation at the top, each open unit's subunits under it. */
export const OrgChart = () => (
  <div className="size-full">
    <ReactFlowProvider>
      <Chart />
    </ReactFlowProvider>
  </div>
);
