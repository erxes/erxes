import { Template } from '@/templates/types/Template';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useQueryState,
} from 'erxes-ui';
import { useRemoveTemplate } from '../hooks/useTemplateRemove';

export const TemplateMoreColumn = (props: CellContext<Template, unknown>) => {
  const product = props.row.original;

  const [, setTemplateId] = useQueryState<string>('templateId');

  const { removeTemplate } = useRemoveTemplate();

  const handleEdit = () => {
    setTemplateId(product._id);
  };

  const handleDelete = () => {
    removeTemplate([product._id]);
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content className="w-30 min-w-30">
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit className="w-4 h-4" />
              Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash className="w-4 h-4" />
              Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const templateMoreColumn: ColumnDef<any> = {
  id: 'more',
  cell: TemplateMoreColumn,
  size: 33,
};
