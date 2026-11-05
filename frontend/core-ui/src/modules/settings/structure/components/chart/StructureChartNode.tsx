import {
  IconChevronDown,
  IconChevronRight,
  IconUsers,
} from '@tabler/icons-react';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { Button, cn, TextOverflowTooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import {
  STRUCTURE_CHART_NODE_HEIGHT,
  STRUCTURE_CHART_NODE_WIDTH,
} from '../../constants/structureChart';
import { useStructureChartContext } from '../../contexts/StructureChartContext';
import { TStructureChartNode } from '../../types/structureChart';

const NODE_SIZE = {
  width: STRUCTURE_CHART_NODE_WIDTH,
  height: STRUCTURE_CHART_NODE_HEIGHT,
};

export const StructureChartNode = ({
  id,
  data,
}: NodeProps<TStructureChartNode>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const {
    canEdit,
    nodeIcon: NodeIcon,
    toggleCollapse,
  } = useStructureChartContext();
  const supervisorIds = data.supervisorId ? [data.supervisorId] : [];
  const isCollapsed = data.hiddenCount > 0;
  const toggleLabel = isCollapsed ? `+${data.hiddenCount}` : data.childCount;
  const CollapseIcon = isCollapsed ? IconChevronRight : IconChevronDown;

  const handleToggle = (event: React.MouseEvent) => {
    // Collapsing must not also open the edit sheet
    event.stopPropagation();
    toggleCollapse(id);
  };

  return (
    <div
      style={NODE_SIZE}
      className={cn(
        'relative flex flex-col justify-between rounded-lg border bg-background px-3 py-2.5 shadow-xs transition-colors',
        canEdit && 'cursor-pointer hover:border-primary',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="opacity-0"
      />
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <NodeIcon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col">
          <TextOverflowTooltip
            value={data.title}
            className="text-sm font-medium leading-tight"
          />
          <span className="truncate font-mono text-xs text-muted-foreground">
            {data.code}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MembersInline
          memberIds={supervisorIds}
          placeholder={t('no-supervisor')}
          size="default"
        />
        <span
          className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-muted px-1.5 py-0.5"
          title={t('team-member-count')}
        >
          <IconUsers className="size-3" />
          {data.userCount}
        </span>
      </div>
      {data.childCount > 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="nodrag nopan absolute -bottom-3 left-1/2 h-6 -translate-x-1/2 gap-0.5 rounded-full border px-1.5"
          aria-label={t(isCollapsed ? 'expand' : 'collapse')}
          title={t(isCollapsed ? 'expand' : 'collapse')}
          onClick={handleToggle}
        >
          <CollapseIcon className="size-3" />
          {toggleLabel}
        </Button>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="opacity-0"
      />
    </div>
  );
};
