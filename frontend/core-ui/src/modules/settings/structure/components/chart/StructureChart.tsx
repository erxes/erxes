import { Icon } from '@tabler/icons-react';
import { Background, ReactFlow } from '@xyflow/react';
import { Spinner, themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  STRUCTURE_CHART_FIT_VIEW_OPTIONS,
  STRUCTURE_CHART_MIN_ZOOM,
} from '../../constants/structureChart';
import { StructureChartContext } from '../../contexts/StructureChartContext';
import { useStructureChart } from '../../hooks/useStructureChart';
import { TStructureCreateTarget } from '../../states/structureCreateState';
import { TStructureChartItem } from '../../types/structureChart';
import { StructureChartControls } from './StructureChartControls';
import { StructureChartEdge } from './StructureChartEdge';
import { StructureChartNode } from './StructureChartNode';
import { StructureChartPlaceholderNode } from './StructureChartPlaceholderNode';
import '@xyflow/react/dist/style.css';

const STRUCTURE_CHART_NODE_TYPES = {
  structure: StructureChartNode,
  placeholder: StructureChartPlaceholderNode,
};
const STRUCTURE_CHART_EDGE_TYPES = { structure: StructureChartEdge };

type TStructureChartProps = {
  items: TStructureChartItem[];
  loading: boolean;
  idParam: string;
  manageAction: string;
  nodeIcon: Icon;
  onCreate: (target: TStructureCreateTarget) => void;
};

export const StructureChart = ({
  items,
  loading,
  idParam,
  manageAction,
  nodeIcon,
  onCreate,
}: TStructureChartProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const theme = useAtomValue(themeState);
  const { nodes, edges, onNodeClick, context } = useStructureChart({
    items,
    idParam,
    manageAction,
    nodeIcon,
    onCreate,
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        {t('chart-empty')}
      </div>
    );
  }

  return (
    <StructureChartContext.Provider value={context}>
      <div className="m-3 min-h-0 flex-1 overflow-hidden rounded-lg border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={STRUCTURE_CHART_NODE_TYPES}
          edgeTypes={STRUCTURE_CHART_EDGE_TYPES}
          colorMode={theme}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={STRUCTURE_CHART_FIT_VIEW_OPTIONS}
          minZoom={STRUCTURE_CHART_MIN_ZOOM}
          // Positions come from the layout; nodes are never dragged or wired by hand
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          deleteKeyCode={null}
        >
          <Background gap={16} />
          <StructureChartControls />
        </ReactFlow>
      </div>
    </StructureChartContext.Provider>
  );
};
