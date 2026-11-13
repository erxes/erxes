import { IconPlus } from '@tabler/icons-react';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  STRUCTURE_CHART_NODE_HEIGHT,
  STRUCTURE_CHART_NODE_WIDTH,
} from '../../constants/structureChart';
import { useStructureChartContext } from '../../contexts/StructureChartContext';
import { TStructureChartPlaceholderNode } from '../../types/structureChart';

// Same footprint as a real node, so it previews where the new one lands
const PLACEHOLDER_SIZE = {
  width: STRUCTURE_CHART_NODE_WIDTH,
  height: STRUCTURE_CHART_NODE_HEIGHT,
};

export const StructureChartPlaceholderNode = ({
  data,
}: NodeProps<TStructureChartPlaceholderNode>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { openCreate } = useStructureChartContext();

  const handleAdd = (event: React.MouseEvent) => {
    event.stopPropagation();
    openCreate({ parentId: data.parentId });
  };

  return (
    <div style={PLACEHOLDER_SIZE}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="opacity-0"
      />
      <Button
        variant="ghost"
        className="nodrag nopan size-full rounded-lg border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
        onClick={handleAdd}
      >
        <IconPlus />
        {t('add-child')}
      </Button>
    </div>
  );
};
