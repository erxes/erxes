import { useTranslation } from 'react-i18next';
import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { IconEdit, IconClock, IconTrash } from '@tabler/icons-react';
import { Can } from 'ui-modules';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  toast,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { IDepartmentListItem } from '../../types/department';
import { renderingDepartmentDetailAtom } from '../../states/renderingDepartmentDetail';
import { useRemoveDepartment } from '../../hooks/useDepartmentActions';

export const DepartmentsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IDepartmentListItem, unknown>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { _id, title } = cell.row.original;
  const [, setOpenDepartment] = useQueryState('department_id');
  const [, setOpenWorkingHours] = useQueryState('workingHoursId');
  const setRenderingDepartmentDetail = useSetAtom(
    renderingDepartmentDetailAtom,
  );
  const { confirm } = useConfirm();
  const { handleRemove } = useRemoveDepartment();

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-item', { title }),
    }).then(async () => {
      try {
        await handleRemove({ variables: { ids: [_id] } });
      } catch (e: any) {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Popover>
      <Can action="departmentsManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Can action="departmentsManage">
              <Command.Item
                value="edit"
                onSelect={() => {
                  setOpenDepartment(_id);
                  setRenderingDepartmentDetail(false);
                }}
              >
                <IconEdit /> {t('edit')}
              </Command.Item>
            </Can>
            <Can action="departmentsManage">
              <Command.Item
                value="workingHours"
                onSelect={() => {
                  setOpenWorkingHours(_id);
                  setRenderingDepartmentDetail(false);
                }}
              >
                <IconClock /> {t('working-hours')}
              </Command.Item>
            </Can>
            <Can action="departmentsManage">
              <Command.Item
                value="delete"
                onSelect={handleDelete}
                className="text-destructive"
              >
                <IconTrash /> {t('delete')}
              </Command.Item>
            </Can>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const DepartmentsMoreColumn = {
  id: 'more',
  cell: DepartmentsMoreColumnCell,
  size: 33,
};
