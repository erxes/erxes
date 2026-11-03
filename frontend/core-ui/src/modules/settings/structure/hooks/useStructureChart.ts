import { Icon } from '@tabler/icons-react';
import { NodeMouseHandler } from '@xyflow/react';
import { useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { usePermissionCheck } from 'ui-modules';
import { TStructureChartContext } from '../contexts/StructureChartContext';
import { TStructureCreateTarget } from '../states/structureCreateState';
import { structureChartEditModeState } from '../states/structureViewState';
import {
  TStructureChartFlowNode,
  TStructureChartItem,
} from '../types/structureChart';
import { buildStructureChart } from '../utils/structureChartLayout';

type TUseStructureChartProps = {
  items: TStructureChartItem[];
  // Query param the page's edit sheet opens on
  idParam: string;
  manageAction: string;
  nodeIcon: Icon;
  onCreate: (target: TStructureCreateTarget) => void;
};

export const useStructureChart = ({
  items,
  idParam,
  manageAction,
  nodeIcon,
  onCreate,
}: TUseStructureChartProps) => {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useAtom(structureChartEditModeState);
  const [, setOpenId] = useQueryState<string>(idParam);
  const { hasActionPermission } = usePermissionCheck();
  const canEdit = hasActionPermission(manageAction);
  const showActions = canEdit && editMode;

  const { nodes, edges } = useMemo(
    () =>
      buildStructureChart(items, {
        collapsedIds,
        withPlaceholders: showActions,
      }),
    [items, collapsedIds, showActions],
  );

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const expandAll = useCallback(() => setCollapsedIds(new Set()), []);

  const collapseAll = useCallback(
    () =>
      setCollapsedIds(
        new Set(
          items.flatMap((item) => (item.parentId ? [item.parentId] : [])),
        ),
      ),
    [items],
  );

  const toggleEditMode = useCallback(
    () => setEditMode((prev) => !prev),
    [setEditMode],
  );

  const onNodeClick: NodeMouseHandler<TStructureChartFlowNode> = (_, node) => {
    if (canEdit && node.type === 'structure') {
      setOpenId(node.id);
    }
  };

  // Stable so panning or unrelated renders don't re-render every node
  const context = useMemo<TStructureChartContext>(
    () => ({
      canEdit,
      editMode,
      showActions,
      nodeIcon,
      toggleCollapse,
      toggleEditMode,
      expandAll,
      collapseAll,
      openCreate: onCreate,
    }),
    [
      canEdit,
      editMode,
      showActions,
      nodeIcon,
      toggleCollapse,
      toggleEditMode,
      expandAll,
      collapseAll,
      onCreate,
    ],
  );

  return { nodes, edges, onNodeClick, context };
};
