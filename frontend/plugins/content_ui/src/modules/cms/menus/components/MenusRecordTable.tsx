import { RecordTable, cn, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  rectIntersection,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAtomValue } from 'jotai';
import { useMenusColumns } from './MenusColumn';
import { MenusCommandBar } from './menus-command-bar/MenusCommandBar';
import { useMenus } from '../hooks/useMenus';
import { CMS_MENU_EDIT, CMS_MENU_REMOVE } from '../../graphql/queries';
import { buildFlatTree, getDepthPrefix } from '@/cms/menus/menuUtils';
import { cmsLanguageAtom } from '@/cms/shared/states/cmsLanguageState';

interface MenuItem {
  _id: string;
  label: string;
  parentId?: string;
  order?: number;
  depth?: number;
  path?: string[];
  [key: string]: unknown;
}

interface MenusRecordTableProps {
  clientPortalId: string;
  kind?: string;
  onEdit: (menu: any) => void;
}

const getParentKey = (menu?: MenuItem) => menu?.parentId || null;

const applySiblingOrder = (
  menus: MenuItem[],
  siblings: MenuItem[],
  locale?: string,
) => {
  const orderById = new Map(
    siblings.map((menu, index) => [menu._id, index + 1]),
  );

  const updatedMenus = menus.map((menu) => {
    const order = orderById.get(menu._id);

    if (typeof order === 'number') {
      return { ...menu, order };
    }

    return menu;
  });

  return buildFlatTree(updatedMenus, locale);
};

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

// Static row for DragOverlay
const StaticMenuRow = ({
  menu,
  columns,
  isOverlay = false,
}: {
  menu: MenuItem;
  columns: any[];
  isOverlay?: boolean;
}) => {
  return (
    <div
      className={cn(
        'flex items-center h-cell border-b bg-background',
        isOverlay && 'opacity-40 border-none',
      )}
    >
      {columns.map((column) => (
        <div
          key={column.id}
          style={{ width: column.size, minWidth: column.size }}
          className="px-2 overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {column.cell ? (
            <div className="flex h-full items-center">
              {/* Simplified rendering for overlay to keep it fast */}
              {column.id === 'label' ? (
                <span className="text-sm font-medium">
                  {getDepthPrefix(menu.depth || 0) + menu.label}
                </span>
              ) : column.id === 'drag' ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="w-4 h-4" />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const SortableMenuRow = React.memo(
  React.forwardRef<
    HTMLTableRowElement,
    React.ComponentProps<typeof RecordTable.Row> & {
      activeId: string | null;
      activeParentId: string | null;
      isDraggingAny: boolean;
    }
  >(
    (
      {
        className,
        original,
        style,
        activeId,
        activeParentId,
        isDraggingAny,
        ...props
      },
      ref,
    ) => {
      const isDraggingItem = activeId === original?._id;
      const isDescendant = activeId && original?.path?.includes(activeId);

      // Siblings of the dragging item are the only ones allowed to move
      const isSibling =
        activeId &&
        !isDraggingItem &&
        (getParentKey(original) || 'root') === activeParentId;

      const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({
          id: original?._id,
          disabled: activeId ? !isDraggingItem && !isSibling : false,
        });

      const setRowRef = useCallback(
        (node: HTMLTableRowElement | null) => {
          setNodeRef(node);

          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (
              ref as React.MutableRefObject<HTMLTableRowElement | null>
            ).current = node;
          }
        },
        [ref, setNodeRef],
      );

      // Completely hide the row and its children in the table while they are in the overlay
      const isHidden = isDraggingItem || isDescendant;

      return (
        <RecordTable.Row
          {...props}
          {...attributes}
          {...listeners}
          ref={setRowRef}
          original={original}
          className={cn(
            'cursor-grab active:cursor-grabbing will-change-transform transition-opacity',
            isHidden && 'opacity-0 pointer-events-none', // Hidden placeholder
            className,
          )}
          style={{
            ...style,
            transform: CSS.Translate.toString(transform),
            transition,
          }}
        />
      );
    },
  ),
);

SortableMenuRow.displayName = 'SortableMenuRow';

const pointerSensorOptions = {
  activationConstraint: { distance: 8 },
};
const keyboardSensorOptions = {
  coordinateGetter: sortableKeyboardCoordinates,
};

/**
 * A high-performance record table for managing CMS menus with drag-and-drop reordering.
 * Uses @dnd-kit for fluid subtree dragging and serialized mutations to prevent race conditions.
 */
export const MenusRecordTable = ({
  clientPortalId,
  kind,
  onEdit,
}: MenusRecordTableProps) => {
  const { menus, loading, refetch } = useMenus({ clientPortalId, kind });
  const language = useAtomValue(cmsLanguageAtom);
  const [orderedMenus, setOrderedMenus] = useState<MenuItem[]>(menus);
  const [reorderingCount, setReorderingCount] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);

  const [removeMenu] = useMutation(CMS_MENU_REMOVE);
  const [editMenu] = useMutation(CMS_MENU_EDIT);
  const isMountedRef = useRef(true);

  // Queue to serialize mutations per parent to prevent race conditions
  const mutationQueueRef = useRef<Record<string, Promise<any>>>({});
  // Ref to avoid stale closure issues in async handlers
  const reorderingCountRef = useRef(reorderingCount);

  useEffect(() => {
    reorderingCountRef.current = reorderingCount;
    if (reorderingCount === 0) {
      setOrderedMenus(menus);
    }
  }, [menus, reorderingCount]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clean up mutation queue on unmount
      mutationQueueRef.current = {};
    };
  }, []);

  const pointerSensor = useSensor(PointerSensor, pointerSensorOptions);
  const keyboardSensor = useSensor(KeyboardSensor, keyboardSensorOptions);

  const sensors = useSensors(pointerSensor, keyboardSensor);

  const menuIds = useMemo(
    () => orderedMenus.map((menu) => menu._id),
    [orderedMenus],
  );

  const activeMenu = useMemo(
    () => (activeId ? orderedMenus.find((m) => m._id === activeId) : null),
    [activeId, orderedMenus],
  );

  const activeSubtree = useMemo(() => {
    if (!activeId) return [];
    return orderedMenus.filter(
      (m) => m._id === activeId || m.path?.includes(activeId),
    );
  }, [activeId, orderedMenus]);

  const handleBulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await removeMenu({ variables: { _id: id } });
    }
    refetch();
  };

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = orderedMenus.find((m) => m._id === event.active.id);
      setActiveId(event.active.id as string);
      setActiveParentId(getParentKey(item) || 'root');
    },
    [orderedMenus],
  );

  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      setActiveId(null);
      setActiveParentId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const aMenu = orderedMenus.find((menu) => menu._id === active.id);
      const oMenu = orderedMenus.find((menu) => menu._id === over.id);

      if (!aMenu || !oMenu) {
        return;
      }

      const pId = getParentKey(aMenu) || 'root';

      if (pId !== (getParentKey(oMenu) || 'root')) {
        toast({
          description: 'Menus can only be reordered within the same level.',
        });
        return;
      }

      const siblings = orderedMenus.filter(
        (menu) => (getParentKey(menu) || 'root') === pId,
      );
      const oldIndex = siblings.findIndex((menu) => menu._id === active.id);
      const newIndex = siblings.findIndex((menu) => menu._id === over.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);

      const changes = reorderedSiblings
        .map((menu, index) => ({
          _id: menu._id,
          newOrder: index + 1,
          oldOrder: menu.order,
        }))
        .filter((change) => change.newOrder !== change.oldOrder);

      const nextMenus = applySiblingOrder(
        orderedMenus,
        reorderedSiblings,
        language || 'en',
      );

      setOrderedMenus(nextMenus);
      setReorderingCount((prev) => prev + 1);

      const currentQueue = mutationQueueRef.current[pId] || Promise.resolve();

      const nextMutation = currentQueue
        .then(async () => {
          try {
            await Promise.all(
              changes.map((change) =>
                editMenu({
                  variables: {
                    _id: change._id,
                    input: { order: change.newOrder },
                  },
                }),
              ),
            );
            await refetch();
          } catch (error) {
            if (isMountedRef.current) {
              toast({
                description:
                  error instanceof Error
                    ? error.message
                    : 'Failed to reorder menus.',
              });
              // Use ref value to check if this was the last pending operation
              if (reorderingCountRef.current === 1) {
                setOrderedMenus(menus);
              }
            }
          } finally {
            if (isMountedRef.current) {
              setReorderingCount((prev) => Math.max(0, prev - 1));
            }
          }
        })
        .finally(() => {
          // Clean up completed promise from queue
          if (mutationQueueRef.current[pId] === nextMutation) {
            delete mutationQueueRef.current[pId];
          }
        });

      mutationQueueRef.current[pId] = nextMutation;
    },
    [orderedMenus, language, editMenu, refetch, menus],
  );

  const columns = useMenusColumns(onEdit, refetch);

  // Custom Row component for RecordTable to pass extra props
  const CustomRow = useCallback(
    (props: any) => (
      <SortableMenuRow
        {...props}
        activeId={activeId}
        activeParentId={activeParentId}
        isDraggingAny={!!activeId}
      />
    ),
    [activeId, activeParentId],
  );

  return (
    <DndContext
      id="cms-menus-dnd"
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setActiveParentId(null);
      }}
    >
      <RecordTable.Provider
        columns={columns}
        data={orderedMenus}
        className="h-full m-3 pb-1"
        stickyColumns={['drag', 'more', 'checkbox', 'label']}
      >
        <SortableContext items={menuIds} strategy={verticalListSortingStrategy}>
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                {loading && <RecordTable.RowSkeleton rows={10} />}
                <RecordTable.RowList Row={CustomRow} />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
        </SortableContext>
        <MenusCommandBar onBulkDelete={handleBulkDelete} />
      </RecordTable.Provider>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeId && activeMenu ? (
          <div className="flex flex-col rounded-md overflow-hidden shadow-2xl ring-1 ring-primary/5">
            {activeSubtree.map((m) => (
              <StaticMenuRow key={m._id} menu={m} columns={columns} isOverlay />
            ))}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
