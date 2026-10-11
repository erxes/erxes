import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  NodeChange,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  IconClock,
  IconInfoCircle,
  IconSitemap,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import {
  Button,
  cn,
  DropdownMenu,
  Empty,
  Spinner,
  themeState,
  toast,
  Tooltip,
  useConfirm,
} from 'erxes-ui';
import { usePermissionCheck } from 'ui-modules';
import {
  buildChartLayout,
  getSubtreeIds,
} from '../../utils/chartLayout';
import { routeEdge, RoutingRect } from '../../utils/edgeRouting';
import {
  IStructureChartItem,
  IStructureChartUnit,
  StructureChartView,
} from '../../types/chart';
import {
  useChartUnits,
  useStructureChartItems,
} from '../../hooks/useStructureChartData';
import {
  useDepartmentEdit,
  useRemoveDepartment,
} from '../../hooks/useDepartmentActions';
import {
  useBranchEdit,
  useRemoveBranch,
} from '../../hooks/useBranchActions';
import {
  usePositionEdit,
  useRemovePosition,
} from '../../hooks/usePositionActions';
import {
  StructureFlowNode,
  StructureNodeCard,
} from './StructureNodeCard';
import { StructureEdge } from './StructureEdge';
import { CreateDepartment } from '../departments/CreateDepartment';
import { CreateBranch } from '../branches/CreateBranch';
import { CreatePosition } from '../positions/CreatePosition';
import { CreateUnit } from '../units/CreateUnit';

const NODE_WIDTH = 264;
const NODE_HEIGHT = 96;
const FIT_VIEW_DURATION_MS = 400;
const nodeTypes = { structure: StructureNodeCard };
const edgeTypes = { structure: StructureEdge };

const DETAIL_PARAM: Record<StructureChartView, string> = {
  departments: 'department_id',
  branches: 'branch_id',
  positions: 'position_id',
};

const MANAGE_ACTION: Record<StructureChartView, string> = {
  departments: 'departmentsManage',
  branches: 'branchesManage',
  positions: 'positionsManage',
};

const VIEW_LABEL: Record<StructureChartView, string> = {
  departments: 'department',
  branches: 'branch',
  positions: 'position',
};

const CanvasInner = ({
  view,
  search,
  emptyAction,
}: {
  view: StructureChartView;
  search: string;
  emptyAction: React.ReactNode;
}) => {
  const theme = useAtomValue(themeState);
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManage = isLoaded && hasActionPermission(MANAGE_ACTION[view]);
  const { fitView, getIntersectingNodes } = useReactFlow<StructureFlowNode>();

  const { items, loading, error, refetch } = useStructureChartItems(view);
  const { units } = useChartUnits({ skip: view !== 'departments' });

  const { handleEdit: editDepartment } = useDepartmentEdit();
  const { handleEdit: editBranch } = useBranchEdit();
  const { handleEdit: editPosition } = usePositionEdit();
  const { handleRemove: removeDepartment } = useRemoveDepartment();
  const { handleRemove: removeBranch } = useRemoveBranch();
  const { handleRemove: removePosition } = useRemovePosition();

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [dragPositions, setDragPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [manualOffsets, setManualOffsets] = useState<
    Record<string, { dx: number; dy: number }>
  >({});
  const [nodeDims, setNodeDims] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingMoves, setPendingMoves] = useState<
    Record<string, string | null>
  >({});
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);
  const [addUnitDepartmentId, setAddUnitDepartmentId] = useState<string | null>(
    null,
  );
  const [menuFor, setMenuFor] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const topZoneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDragEndRef = useRef(0);
  const fittedViews = useRef<Set<string>>(new Set());

  const effectiveItems = useMemo<IStructureChartItem[]>(
    () =>
      items.map((item) =>
        item._id in pendingMoves
          ? { ...item, parentId: pendingMoves[item._id] }
          : item,
      ),
    [items, pendingMoves],
  );

  useEffect(() => {
    setPendingMoves((previous) => {
      let changed = false;
      const next = { ...previous };
      for (const [id, parentId] of Object.entries(previous)) {
        const item = items.find((entry) => entry._id === id);
        if (item && (item.parentId ?? null) === (parentId ?? null)) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : previous;
    });
  }, [items]);

  const normalizedSearch = search.trim().toLowerCase();
  const matchIds = useMemo(() => {
    if (!normalizedSearch) return [];
    return effectiveItems
      .filter(
        (item) =>
          (item.title || '').toLowerCase().includes(normalizedSearch) ||
          (item.code || '').toLowerCase().includes(normalizedSearch),
      )
      .map((item) => item._id);
  }, [effectiveItems, normalizedSearch]);

  const matchSet = useMemo(() => new Set(matchIds), [matchIds]);

  const unitsByDepartment = useMemo(() => {
    const map = new Map<string, IStructureChartUnit[]>();
    for (const unit of units) {
      if (!unit.departmentId) continue;
      const list = map.get(unit.departmentId) || [];
      list.push(unit);
      map.set(unit.departmentId, list);
    }
    return map;
  }, [units]);

  const layout = useMemo(
    () =>
      buildChartLayout(effectiveItems, collapsedIds, {
        nodeWidth: NODE_WIDTH,
        nodeHeight: 96,
        hGap: 40,
        vGap: 72,
      }),
    [effectiveItems, collapsedIds],
  );

  const openDetail = useCallback(
    (key: string, id: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (id) {
        next.set(key, id);
      } else {
        next.delete(key);
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const onOpenDetail = useCallback(
    (id: string) => openDetail(DETAIL_PARAM[view], id),
    [openDetail, view],
  );

  const onOpenUnit = useCallback(
    (id: string) => openDetail('unit_id', id),
    [openDetail],
  );

  const onToggleCollapse = useCallback((id: string) => {
    setCollapsedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const onWorkingHours = useCallback(
    (id: string) => openDetail('workingHoursId', id),
    [openDetail],
  );

  const membersFilterKey =
    view === 'branches' ? 'branchIds' : 'departmentIds';

  const onOpenMembers = useCallback(
    (id: string) =>
      navigate(
        `/team/members?${membersFilterKey}=${encodeURIComponent(
          JSON.stringify([id]),
        )}`,
      ),
    [navigate, membersFilterKey],
  );

  const onAddChild = useCallback(
    (id: string) => setAddChildParentId(id),
    [],
  );

  const onAddUnit = useCallback(
    (id: string) => setAddUnitDepartmentId(id),
    [],
  );

  const onRequestMenu = useCallback(
    (id: string, anchor: HTMLElement) => {
      const rect = anchor.getBoundingClientRect();
      const container = containerRef.current?.getBoundingClientRect();
      setMenuFor({
        id,
        x: rect.left - (container?.left ?? 0),
        y: rect.bottom + 4 - (container?.top ?? 0),
      });
    },
    [],
  );

  const editByView = useCallback(
    (variables: {
      id: string;
      parentId: string | null;
      code?: string | null;
      title?: string | null;
      userIds?: string[] | null;
      status?: string | null;
    }) =>
      view === 'departments'
        ? editDepartment({ variables })
        : view === 'branches'
          ? editBranch({ variables })
          : editPosition({ variables }),
    [view, editDepartment, editBranch, editPosition],
  );

  const moveNode = useCallback(
    (nodeId: string, parentId: string | null) => {
      const item = items.find((entry) => entry._id === nodeId);
      if (!item || (item.parentId ?? null) === parentId) return;

      setPendingMoves((previous) => ({ ...previous, [nodeId]: parentId }));
      setManualOffsets((previous) => {
        const next = { ...previous };
        delete next[nodeId];
        return next;
      });
      editByView({
        id: nodeId,
        parentId,
        code: item.code,
        title: item.title,
        userIds: item.userIds || [],
        status: item.status,
      })
        .then(() => toast({ title: 'Moved successfully' }))
        .catch((mutationError: Error) => {
          setPendingMoves((previous) => {
            const next = { ...previous };
            delete next[nodeId];
            return next;
          });
          toast({
            title: 'Could not move',
            description: mutationError.message,
            variant: 'destructive',
          });
        });
    },
    [items, editByView],
  );

  const onDelete = useCallback(
    (id: string) => {
      const item = items.find((entry) => entry._id === id);
      if (!item) return;
      const childCount = layout.childrenById.get(id)?.length ?? 0;
      confirm({
        message: `Delete "${item.title || item.code || 'this item'}"${
          childCount > 0 ? ` and its ${childCount} child item(s)` : ''
        }?`,
      }).then(() => {
        const remove =
          view === 'departments'
            ? removeDepartment
            : view === 'branches'
              ? removeBranch
              : removePosition;
        remove({ variables: { ids: [id] } }).catch((mutationError: Error) =>
          toast({
            title: 'Could not delete',
            description: mutationError.message,
            variant: 'destructive',
          }),
        );
      });
    },
    [
      items,
      layout.childrenById,
      view,
      confirm,
      removeDepartment,
      removeBranch,
      removePosition,
    ],
  );

  const nodes = useMemo<StructureFlowNode[]>(() => {
    const nodeList: StructureFlowNode[] = [];
    for (const item of effectiveItems) {
      const position = layout.positions.get(item._id);
      if (!position) continue;
      const dragged = dragPositions[item._id];
      const offset = manualOffsets[item._id];
      const children = layout.childrenById.get(item._id) || [];
      nodeList.push({
        id: item._id,
        type: 'structure',
        measured: nodeDims[item._id],
        position: dragged ?? {
          x: position.x + (offset?.dx ?? 0),
          y: position.y + (offset?.dy ?? 0),
        },
        data: {
          item,
          view,
          childrenCount: children.length,
          collapsed: collapsedIds.has(item._id),
          dimmed: matchIds.length > 0 && !matchSet.has(item._id),
          dropTarget: dropTargetId === item._id,
          pending: item._id in pendingMoves,
          canManage,
          units: unitsByDepartment.get(item._id) || [],
          onToggleCollapse,
          onOpenDetail,
          onOpenUnit,
          onAddChild,
          onAddUnit,
          onRequestMenu,
          onOpenMembers: view === 'positions' ? undefined : onOpenMembers,
        },
      });
    }
    return nodeList;
  }, [
    effectiveItems,
    layout,
    dragPositions,
    manualOffsets,
    nodeDims,
    collapsedIds,
    matchIds.length,
    matchSet,
    dropTargetId,
    pendingMoves,
    canManage,
    unitsByDepartment,
    view,
    onToggleCollapse,
    onOpenDetail,
    onOpenUnit,
    onAddChild,
    onAddUnit,
    onRequestMenu,
    onOpenMembers,
  ]);

  const nodeRects = useMemo(() => {
    const map = new Map<string, RoutingRect>();
    for (const node of nodes) {
      map.set(node.id, {
        x: node.position.x,
        y: node.position.y,
        w: nodeDims[node.id]?.width ?? NODE_WIDTH,
        h: nodeDims[node.id]?.height ?? NODE_HEIGHT,
      });
    }
    return map;
  }, [nodes, nodeDims]);

  const edges = useMemo<Edge[]>(() => {
    const rectEntries = [...nodeRects.entries()];
    return layout.edges.map((edge) => {
      const source = nodeRects.get(edge.source);
      const target = nodeRects.get(edge.target);
      if (!source || !target) {
        return { ...edge, type: 'structure' };
      }
      const obstacles = rectEntries
        .filter(([id]) => id !== edge.source && id !== edge.target)
        .map(([, rect]) => rect);
      const routed = routeEdge({ source, target, obstacles });
      return {
        ...edge,
        type: 'structure',
        sourceHandle: routed.sourceHandle,
        targetHandle: routed.targetHandle,
        data: { points: routed.points },
      };
    });
  }, [layout, nodeRects]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const measured: Record<string, { width: number; height: number }> = {};
    for (const change of changes) {
      if (change.type === 'dimensions' && change.dimensions) {
        measured[change.id] = change.dimensions;
      }
    }
    if (Object.keys(measured).length > 0) {
      setNodeDims((previous) => ({ ...previous, ...measured }));
    }
    setDragPositions((previous) => {
      const next = { ...previous };
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          next[change.id] = change.position;
        }
      }
      return next;
    });
  }, []);

  const onNodeDrag = useCallback(
    (_event: MouseEvent | TouchEvent, node: StructureFlowNode) => {
      setIsDragging(true);
      if (!canManage) return;
      const descendants = getSubtreeIds(layout.childrenById, node.id);
      const hit = getIntersectingNodes(node).find(
        (other) => other.id !== node.id && !descendants.has(other.id),
      );
      setDropTargetId(hit?.id ?? null);
    },
    [canManage, layout.childrenById, getIntersectingNodes],
  );

  const keepManualPosition = useCallback(
    (node: StructureFlowNode) => {
      const base = layout.positions.get(node.id);
      if (!base) return;
      setManualOffsets((previous) => ({
        ...previous,
        [node.id]: {
          dx: node.position.x - base.x,
          dy: node.position.y - base.y,
        },
      }));
    },
    [layout.positions],
  );

  const onNodeDragStop = useCallback(
    (event: MouseEvent | TouchEvent, node: StructureFlowNode) => {
      const descendants = getSubtreeIds(layout.childrenById, node.id);
      const intersecting = getIntersectingNodes(node);
      setDropTargetId(null);
      setIsDragging(false);
      setDragPositions({});
      lastDragEndRef.current = Date.now();

      const item = items.find((entry) => entry._id === node.id);
      if (!item || !canManage) {
        keepManualPosition(node);
        return;
      }

      const hit = intersecting.find((other) => other.id !== node.id);
      if (hit) {
        if (descendants.has(hit.id)) {
          toast({
            title: 'Cannot move a node into its own subtree',
            variant: 'destructive',
          });
          keepManualPosition(node);
          return;
        }
        if ((item.parentId ?? null) === hit.id) {
          keepManualPosition(node);
          return;
        }
        moveNode(node.id, hit.id);
        return;
      }

      const rect = topZoneRef.current?.getBoundingClientRect();
      const point =
        'changedTouches' in event
          ? event.changedTouches[0]
          : event;
      if (
        rect &&
        point.clientX >= rect.left &&
        point.clientX <= rect.right &&
        point.clientY >= rect.top &&
        point.clientY <= rect.bottom &&
        item.parentId
      ) {
        moveNode(node.id, null);
        return;
      }
      keepManualPosition(node);
    },
    [
      items,
      canManage,
      layout.childrenById,
      getIntersectingNodes,
      moveNode,
      keepManualPosition,
    ],
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: StructureFlowNode) => {
      if ((event.target as HTMLElement).closest('.nodrag')) return;
      if (Date.now() - lastDragEndRef.current < 300) return;
      onOpenDetail(node.id);
    },
    [onOpenDetail],
  );

  useEffect(() => {
    if (nodes.length === 0) return;
    if (fittedViews.current.has(view)) return;
    fittedViews.current.add(view);
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: FIT_VIEW_DURATION_MS });
    }, 0);
    return () => clearTimeout(timer);
  }, [view, nodes.length, fitView]);

  useEffect(() => {
    if (matchIds.length === 0) return;
    const timer = setTimeout(() => {
      fitView({
        nodes: matchIds.map((id) => ({ id })),
        padding: 0.3,
        duration: FIT_VIEW_DURATION_MS,
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [matchIds, fitView]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div role="alert" className="text-sm text-destructive">
          Could not load {VIEW_LABEL[view]}s: {error.message}
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty className="h-full">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconSitemap />
          </Empty.Media>
          <Empty.Title>No {VIEW_LABEL[view]}s yet</Empty.Title>
          <Empty.Description>
            Add the first {VIEW_LABEL[view]} to build the organization chart.
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>{emptyAction}</Empty.Content>
      </Empty>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        nodesConnectable={false}
        nodesDraggable
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode={theme === 'dark' ? 'dark' : 'light'}
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls position="bottom-right" showInteractive={false} />
        {nodes.length > 30 && (
          <MiniMap
            pannable
            zoomable
            position="bottom-left"
            className="overflow-hidden rounded-md border shadow-sm"
            style={{ width: 140, height: 100 }}
          />
        )}
        <Panel position="top-center">
          <div
            ref={topZoneRef}
            className={cn(
              'flex items-center gap-2 rounded-md border border-dashed px-4 py-1.5 text-xs text-muted-foreground bg-background/80',
              isDragging && dropTargetId === null && 'border-primary text-primary',
            )}
          >
            Top level
            <Tooltip>
              <Tooltip.Trigger asChild>
                <button type="button" aria-label="Ordering info">
                  <IconInfoCircle className="size-3.5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                Order within a level follows the code
              </Tooltip.Content>
            </Tooltip>
          </div>
        </Panel>
      </ReactFlow>

      {view === 'departments' && (
        <>
          <CreateDepartment
            open={addChildParentId !== null}
            onOpenChange={(open) => {
              if (!open) setAddChildParentId(null);
            }}
            defaultParentId={addChildParentId ?? undefined}
          />
          <CreateUnit
            open={addUnitDepartmentId !== null}
            onOpenChange={(open) => {
              if (!open) setAddUnitDepartmentId(null);
            }}
            defaultParentId={addUnitDepartmentId ?? undefined}
          />
        </>
      )}
      {view === 'branches' && (
        <CreateBranch
          open={addChildParentId !== null}
          onOpenChange={(open) => {
            if (!open) setAddChildParentId(null);
          }}
          defaultParentId={addChildParentId ?? undefined}
        />
      )}
      {view === 'positions' && (
        <CreatePosition
          open={addChildParentId !== null}
          onOpenChange={(open) => {
            if (!open) setAddChildParentId(null);
          }}
          defaultParentId={addChildParentId ?? undefined}
        />
      )}

      <DropdownMenu
        open={menuFor !== null}
        onOpenChange={(open) => {
          if (!open) setMenuFor(null);
        }}
      >
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="pointer-events-none absolute size-px opacity-0"
            style={
              menuFor
                ? { left: menuFor.x, top: menuFor.y }
                : { display: 'none' }
            }
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start">
          {(view === 'departments' || view === 'branches') && (
            <DropdownMenu.Item
              onClick={() => {
                if (menuFor) onWorkingHours(menuFor.id);
              }}
            >
              <IconClock className="size-4" /> Working hours
            </DropdownMenu.Item>
          )}
          {view !== 'positions' && (
            <DropdownMenu.Item
              onClick={() => {
                if (menuFor) onOpenMembers(menuFor.id);
              }}
            >
              <IconUsers className="size-4" /> Members
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            className="text-destructive"
            onClick={() => {
              if (menuFor) onDelete(menuFor.id);
            }}
          >
            <IconTrash className="size-4" /> Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};

export const StructureChartCanvas = (props: {
  view: StructureChartView;
  search: string;
  emptyAction: React.ReactNode;
}) => (
  <ReactFlowProvider>
    <CanvasInner {...props} />
  </ReactFlowProvider>
);
