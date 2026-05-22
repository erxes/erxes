import { RecordTable, cn, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
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
import { buildFlatTree } from '@/cms/menus/menuUtils';
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

const DragTransformContext = React.createContext<{
  activeId: string | null;
  activeParentId: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}>({
  activeId: null,
  activeParentId: null,
  containerRef: { current: null },
});

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

const SortableMenuRow = React.memo(
  React.forwardRef<
    HTMLTableRowElement,
    React.ComponentProps<typeof RecordTable.Row>
  >(({ className, original, style, ...props }, ref) => {
    const { activeId, activeParentId, containerRef } = React.useContext(
      DragTransformContext,
    );

    const isDraggingItem = activeId === original?._id;
    const isSibling =
      activeId &&
      !isDraggingItem &&
      (getParentKey(original) || 'root') === activeParentId;

    const {
      attributes,
      isDragging,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({
      id: original?._id,
      // Disable sortable logic for items that don't need to move (non-siblings)
      // This is the primary performance win.
      disabled: activeId ? !isDraggingItem && !isSibling : false,
    });

    const setRowRef = useCallback(
      (node: HTMLTableRowElement | null) => {
        setNodeRef(node);

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTableRowElement | null>).current =
            node;
        }
      },
      [ref, setNodeRef],
    );

    const isDescendant = useMemo(() => {
      if (!activeId || !original?.path) return false;
      return original.path.includes(activeId);
    }, [activeId, original?.path]);

    useEffect(() => {
      if (isDragging && containerRef.current) {
        const container = containerRef.current;
        const tStr = CSS.Transform.toString(transform) || 'none';
        container.style.setProperty('--drag-transform', tStr);
        container.style.setProperty('--drag-transition', transition || 'none');

        return () => {
          container.style.removeProperty('--drag-transform');
          container.style.removeProperty('--drag-transition');
        };
      }
    }, [isDragging, transform, transition, containerRef]);

    const effectiveTransform = isDragging
      ? CSS.Transform.toString(transform)
      : isDescendant
        ? 'var(--drag-transform)'
        : CSS.Transform.toString(transform);

    const effectiveTransition = isDragging
      ? transition
      : isDescendant
        ? 'var(--drag-transition)'
        : transition;

    return (
      <RecordTable.Row
        {...props}
        {...attributes}
        {...listeners}
        ref={setRowRef}
        original={original}
        className={cn(
          'cursor-grab active:cursor-grabbing will-change-transform',
          isDragging && 'relative z-10 opacity-60',
          isDescendant && 'relative z-10 opacity-80',
          className,
        )}
        style={{
          ...style,
          transform: effectiveTransform,
          transition: effectiveTransition,
        }}
      />
    );
  }),
);

SortableMenuRow.displayName = 'SortableMenuRow';

const pointerSensorOptions = {
  activationConstraint: { distance: 8 },
};
const keyboardSensorOptions = {
  coordinateGetter: sortableKeyboardCoordinates,
};

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
  const containerRef = useRef<HTMLDivElement>(null);

  const [removeMenu] = useMutation(CMS_MENU_REMOVE);
  const [editMenu] = useMutation(CMS_MENU_EDIT);
  const isMountedRef = useRef(true);
  
  // Queue to serialize mutations per parent to prevent race conditions
  const mutationQueueRef = useRef<Record<string, Promise<any>>>({});

  useEffect(() => {
    if (reorderingCount === 0) {
      setOrderedMenus(menus);
    }
  }, [menus, reorderingCount]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mouseSensor = useSensor(PointerSensor, pointerSensorOptions);
  const keyboardSensor = useSensor(KeyboardSensor, keyboardSensorOptions);

  const sensors = useMemo(() => [mouseSensor, keyboardSensor], [
    mouseSensor,
    keyboardSensor,
  ]);

  const menuIds = useMemo(
    () => orderedMenus.map((menu) => menu._id),
    [orderedMenus],
  );

  const handleBulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await removeMenu({ variables: { _id: id } });
    }
    refetch();
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeMenu = orderedMenus.find((m) => m._id === event.active.id);
    setActiveId(event.active.id as string);
    setActiveParentId(getParentKey(activeMenu) || 'root');
  };

  /**
   * Handles the end of a drag operation.
   * Optimistically updates the UI and enqueues the server mutations
   * to be processed sequentially per parent level.
   */
  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      setActiveId(null);
      setActiveParentId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const activeMenu = orderedMenus.find((menu) => menu._id === active.id);
      const overMenu = orderedMenus.find((menu) => menu._id === over.id);

      if (!activeMenu || !overMenu) {
        return;
      }

      const parentId = getParentKey(activeMenu) || 'root';

      if (parentId !== (getParentKey(overMenu) || 'root')) {
        toast({
          description: 'Menus can only be reordered within the same level.',
        });
        return;
      }

      const siblings = orderedMenus.filter(
        (menu) => (getParentKey(menu) || 'root') === parentId,
      );
      const oldIndex = siblings.findIndex((menu) => menu._id === active.id);
      const newIndex = siblings.findIndex((menu) => menu._id === over.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);
      
      // Only update items whose order actually changed
      const changes = reorderedSiblings
        .map((menu, index) => ({
          _id: menu._id,
          newOrder: index + 1,
          oldOrder: menu.order
        }))
        .filter(change => change.newOrder !== change.oldOrder);

      const nextMenus = applySiblingOrder(
        orderedMenus,
        reorderedSiblings,
        language || 'en',
      );

      // Optimistic update
      setOrderedMenus(nextMenus);
      setReorderingCount((prev) => prev + 1);

      // Serialize mutations for this parent level
      const currentQueue = mutationQueueRef.current[parentId] || Promise.resolve();
      
      const nextMutation = currentQueue.then(async () => {
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
            // Revert on error if this was the last pending reorder for this parent
            setOrderedMenus((current) => {
              // If we've already moved on to more reorders, don't revert to stale data
              return reorderingCount === 1 ? menus : current;
            });
          }
        } finally {
          if (isMountedRef.current) {
            setReorderingCount((prev) => Math.max(0, prev - 1));
          }
        }
      });

      mutationQueueRef.current[parentId] = nextMutation;
    },
    [orderedMenus, language, editMenu, refetch, menus, reorderingCount],
  );

  const columns = useMenusColumns(onEdit, refetch);

  return (
    <DndContext
      id="cms-menus-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setActiveParentId(null);
      }}
    >
      <DragTransformContext.Provider
        value={{
          activeId,
          activeParentId,
          containerRef,
        }}
      >
        <div ref={containerRef} className="h-full">
          <RecordTable.Provider
            columns={columns}
            data={orderedMenus}
            className="h-full m-3 pb-1"
            stickyColumns={['drag', 'more', 'checkbox', 'label']}
          >
            <SortableContext
              items={menuIds}
              strategy={verticalListSortingStrategy}
            >
              <RecordTable.Scroll>
                <RecordTable>
                  <RecordTable.Header />
                  <RecordTable.Body>
                    {loading && <RecordTable.RowSkeleton rows={10} />}
                    <RecordTable.RowList Row={SortableMenuRow} />
                  </RecordTable.Body>
                </RecordTable>
              </RecordTable.Scroll>
            </SortableContext>
            <MenusCommandBar onBulkDelete={handleBulkDelete} />
          </RecordTable.Provider>
        </div>
      </DragTransformContext.Provider>
    </DndContext>
  );
};
