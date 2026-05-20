import { RecordTable } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useMenusColumns } from './MenusColumn';
import { MenusCommandBar } from './menus-command-bar/MenusCommandBar';
import { useMenus } from '../hooks/useMenus';
import { CMS_MENU_EDIT, CMS_MENU_REMOVE } from '../../graphql/queries';
import { useCallback, useRef, useState } from 'react';
import type { ComponentProps } from 'react';

type MenuItem = {
  _id: string;
  label: string;
  parentId?: string | null;
  order?: number;
  [key: string]: unknown;
};

interface MenusRecordTableProps {
  clientPortalId: string;
  kind?: string;
  onEdit: (menu: any) => void;
}

export const MenusRecordTable = ({
  clientPortalId,
  kind,
  onEdit,
}: MenusRecordTableProps) => {
  const { menus, loading, refetch } = useMenus({ clientPortalId, kind });
  const [removeMenu] = useMutation(CMS_MENU_REMOVE);
  const [editMenu] = useMutation(CMS_MENU_EDIT);
  const draggedIdRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleBulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await removeMenu({ variables: { _id: id } });
    }
    refetch();
  };

  const columns = useMenusColumns(onEdit, refetch);

  const isInsideSubtree = useCallback(
    (parentId: string | null | undefined, itemId: string): boolean => {
      let currentParentId = parentId || null;

      while (currentParentId) {
        if (currentParentId === itemId) return true;

        currentParentId =
          (menus.find((menu) => menu._id === currentParentId)?.parentId as
            | string
            | undefined) || null;
      }

      return false;
    },
    [menus],
  );

  const getSiblings = useCallback(
    (parentId: string | null, exceptId?: string) =>
      menus
        .filter(
          (menu) =>
            (menu.parentId || null) === parentId && menu._id !== exceptId,
        )
        .sort((a, b) => {
          const orderA =
            typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
          const orderB =
            typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;

          if (orderA !== orderB) return orderA - orderB;

          return a.label.localeCompare(b.label, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
        }),
    [menus],
  );

  const persistMenuOrder = useCallback(
    async (draggedId: string, overId: string) => {
      if (draggedId === overId) return;

      const draggedMenu = menus.find((menu) => menu._id === draggedId);
      const overMenu = menus.find((menu) => menu._id === overId);

      if (!draggedMenu || !overMenu) return;

      const sourceParentId = draggedMenu.parentId || null;
      const targetParentId = overMenu.parentId || null;

      if (isInsideSubtree(targetParentId, draggedId)) return;

      const targetSiblings = getSiblings(targetParentId, draggedId);
      const overIndex = targetSiblings.findIndex((menu) => menu._id === overId);

      if (overIndex === -1) return;

      const nextTargetSiblings = [
        ...targetSiblings.slice(0, overIndex),
        { ...draggedMenu, parentId: targetParentId },
        ...targetSiblings.slice(overIndex),
      ];
      const updateMap = new Map<string, Record<string, unknown>>();

      nextTargetSiblings.forEach((menu, index) => {
        updateMap.set(menu._id, {
          ...(updateMap.get(menu._id) || {}),
          parentId: menu._id === draggedId ? targetParentId : menu.parentId,
          order: index + 1,
        });
      });

      if (sourceParentId !== targetParentId) {
        getSiblings(sourceParentId, draggedId).forEach((menu, index) => {
          updateMap.set(menu._id, {
            ...(updateMap.get(menu._id) || {}),
            order: index + 1,
          });
        });
      }

      await Promise.all(
        Array.from(updateMap.entries()).map(([id, input]) =>
          editMenu({
            variables: {
              _id: id,
              input,
            },
          }),
        ),
      );

      await refetch();
    },
    [editMenu, getSiblings, isInsideSubtree, menus, refetch],
  );

  const DraggableMenuRow = useCallback(
    (props: ComponentProps<typeof RecordTable.Row>) => {
      const menu = props.original as MenuItem | undefined;
      const isDragOver = menu?._id && dragOverId === menu._id;

      return (
        <RecordTable.Row
          {...props}
          draggable={Boolean(menu?._id)}
          onDragStart={(event) => {
            if (!menu?._id) return;
            draggedIdRef.current = menu._id;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', menu._id);
          }}
          onDragOver={(event) => {
            if (!menu?._id || draggedIdRef.current === menu._id) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            setDragOverId(menu._id);
          }}
          onDragLeave={() => {
            if (dragOverId === menu?._id) setDragOverId(null);
          }}
          onDrop={async (event) => {
            event.preventDefault();
            const draggedId =
              draggedIdRef.current || event.dataTransfer.getData('text/plain');

            draggedIdRef.current = null;
            setDragOverId(null);

            if (!draggedId || !menu?._id) return;
            await persistMenuOrder(draggedId, menu._id);
          }}
          onDragEnd={() => {
            draggedIdRef.current = null;
            setDragOverId(null);
          }}
          className={[
            props.className,
            'cursor-grab active:cursor-grabbing',
            isDragOver ? 'outline outline-2 outline-primary' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      );
    },
    [dragOverId, persistMenuOrder],
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={menus}
      className="h-full m-3 pb-1"
      stickyColumns={['more', 'checkbox', 'label']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={10} />}
            <RecordTable.RowList Row={DraggableMenuRow} />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <MenusCommandBar onBulkDelete={handleBulkDelete} />
    </RecordTable.Provider>
  );
};
