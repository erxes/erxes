import { RecordTable } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useMenusColumns } from './MenusColumn';
import { MenusCommandBar } from './menus-command-bar/MenusCommandBar';
import { useMenus } from '../hooks/useMenus';
import { CMS_MENU_REMOVE } from '../../graphql/queries';

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

  const handleBulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await removeMenu({ variables: { _id: id } });
    }
    refetch();
  };

  const columns = useMenusColumns(onEdit, refetch);

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
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <MenusCommandBar onBulkDelete={handleBulkDelete} />
    </RecordTable.Provider>
  );
};
