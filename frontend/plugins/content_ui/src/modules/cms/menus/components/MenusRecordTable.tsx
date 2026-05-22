import { RecordTable, cn, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
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
  [key: string]: unknown;
}

interface MenusRecordTableProps {
  clientPortalId: string;
  kind?: string;
  onEdit: (menu: any) => void;
}

const getParentKey = (menu?: MenuItem) => menu?.parentId || null;
const SortableRowDisabledContext = React.createContext(false);

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

    return order !== undefined ? { ...menu, order } : menu;
  });

  return buildFlatTree(updatedMenus, locale);
};

type SortableMenuRowProps = React.ComponentProps<typeof RecordTable.Row> & {
  disabled?: boolean;
};

const SortableMenuRow = React.forwardRef<
  HTMLTableRowElement,
  SortableMenuRowProps
>(({ className, disabled, original, style, ...props }, ref) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: original?._id,
    disabled: disabled || !original?._id,
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

  return (
    <RecordTable.Row
      {...props}
      {...attributes}
      {...listeners}
      ref={setRowRef}
      original={original}
      className={cn(
        'cursor-grab active:cursor-grabbing',
        isDragging && 'relative z-10 opacity-60',
        disabled && 'cursor-default',
        className,
      )}
      style={{
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    />
  );
});

SortableMenuRow.displayName = 'SortableMenuRow';

const SortableMenuRowWithContext = (
  props: React.ComponentProps<typeof RecordTable.Row>,
) => {
  const disabled = React.useContext(SortableRowDisabledContext);

  return <SortableMenuRow {...props} disabled={disabled} />;
};

SortableMenuRowWithContext.displayName = 'SortableMenuRowWithContext';

export const MenusRecordTable = ({
  clientPortalId,
  kind,
  onEdit,
}: MenusRecordTableProps) => {
  const { menus, loading, refetch } = useMenus({ clientPortalId, kind });
  const language = useAtomValue(cmsLanguageAtom);
  const [orderedMenus, setOrderedMenus] = useState<MenuItem[]>(menus);
  const [isReordering, setIsReordering] = useState(false);
  const [removeMenu] = useMutation(CMS_MENU_REMOVE);
  const [editMenu] = useMutation(CMS_MENU_EDIT);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setOrderedMenus(menus);
  }, [menus]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || isReordering) {
      return;
    }

    const activeMenu = orderedMenus.find((menu) => menu._id === active.id);
    const overMenu = orderedMenus.find((menu) => menu._id === over.id);

    if (!activeMenu || !overMenu) {
      return;
    }

    const parentId = getParentKey(activeMenu);

    if (parentId !== getParentKey(overMenu)) {
      toast({
        description: 'Menus can only be reordered within the same level.',
      });
      return;
    }

    const siblings = orderedMenus.filter(
      (menu) => getParentKey(menu) === parentId,
    );
    const oldIndex = siblings.findIndex((menu) => menu._id === active.id);
    const newIndex = siblings.findIndex((menu) => menu._id === over.id);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }

    const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);
    const nextMenus = applySiblingOrder(
      orderedMenus,
      reorderedSiblings,
      language || 'en',
    );

    setOrderedMenus(nextMenus);
    setIsReordering(true);

    try {
      await Promise.all(
        reorderedSiblings.map((menu, index) =>
          editMenu({
            variables: {
              _id: menu._id,
              input: { order: index + 1 },
            },
          }),
        ),
      );
    } catch (error) {
      if (isMountedRef.current) {
        toast({
          description:
            error instanceof Error ? error.message : 'Failed to reorder menus.',
        });
      }
    } finally {
      try {
        await refetch();
      } finally {
        if (isMountedRef.current) {
          setIsReordering(false);
        }
      }
    }
  };

  const columns = useMenusColumns(onEdit, refetch);

  return (
    <RecordTable.Provider
      columns={columns}
      data={orderedMenus}
      className="h-full m-3 pb-1"
      stickyColumns={['drag', 'more', 'checkbox', 'label']}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableRowDisabledContext.Provider value={isReordering}>
          <SortableContext
            items={menuIds}
            strategy={verticalListSortingStrategy}
          >
            <RecordTable.Scroll>
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  {loading && <RecordTable.RowSkeleton rows={10} />}
                  <RecordTable.RowList Row={SortableMenuRowWithContext} />
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.Scroll>
          </SortableContext>
        </SortableRowDisabledContext.Provider>
      </DndContext>
      <MenusCommandBar onBulkDelete={handleBulkDelete} />
    </RecordTable.Provider>
  );
};
