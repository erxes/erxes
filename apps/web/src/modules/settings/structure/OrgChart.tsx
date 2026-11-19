import type { UnitNode } from '@erxes/core-contract';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import {
  Background,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
} from '@xyflow/react';
import { Button, themeState, Tooltip } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { type ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DraftCard, HeadCard, MoreCard, UnitFrame } from './ChartCards';
import { ANIMATION, useChartFocus } from './chartFocus';
import { layoutChart } from './chartLayout';
import { ChartOutline } from './ChartOutline';
import { useWorkspace } from './context';
import { useOpenUnits } from './useOpenUnits';

/** How far under the chart's top edge the organisation's own card starts. */
const TOP_SPACE = 48;

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

const NODE_TYPES = { head: HeadCard, frame: UnitFrame, more: MoreCard, draft: DraftCard };

/**
 * The chart on its canvas. A unit draws open once what it shows has loaded, so it opens at its
 * full size in one go.
 */
const Chart = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const theme = useAtomValue(themeState);

  const {
    index,
    isOpen,
    loading,
    showsAllPeople,
    draftParentId,
    select,
    selectedId,
    closeDraft,
    picked,
    canSeeTeam,
  } = useWorkspace();

  const [ready, setReady] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const open = useOpenUnits(canSeeTeam);

  const { nodes, edges } = layoutChart({
    index,
    isOpen: (unit: UnitNode) =>
      isOpen(unit) && !loading.has(unit.id) && (!canSeeTeam || open.has(unit.id)),
    people: canSeeTeam
      ? (unit: UnitNode) =>
          (open.get(unit.id)?.memberIds ?? []).filter((id) => id !== unit.supervisorId)
      : null,
    showsAllPeople,
    draftParentId,
  });

  const [top] = nodes;

  useChartFocus(nodes, ready);

  return (
    <ReactFlow
      ref={frame}
      className="org-flow"
      aria-label={t('chart-label', 'Organisation chart')}
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      colorMode={theme}
      minZoom={0.1}
      onInit={(instance) => {
        void instance.setViewport({
          x:
            (frame.current?.clientWidth ?? 0) / 2 -
            ((top?.position.x ?? 0) + (top?.width ?? 0) / 2),
          y: TOP_SPACE - (top?.position.y ?? 0),
          zoom: 1,
        });
        setReady(true);
      }}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      deleteKeyCode={null}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      onPaneClick={() => {
        if (draftParentId) closeDraft();
        else if (selectedId || picked.size) select(null);
      }}
      onlyRenderVisibleElements
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={16} />
      <ChartOutline />
      <ZoomControls />
    </ReactFlow>
  );
};

/**
 * The structure as an org chart of people: the organisation at the top, each unit as the person
 * who leads it over a frame with its people, and the units under it below.
 */
export const OrgChart = () => (
  <div className="size-full">
    <ReactFlowProvider>
      <Chart />
    </ReactFlowProvider>
  </div>
);
