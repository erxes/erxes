import { useTemplateCategoryRemove } from '@/templates/hooks/useTemplateCategoryRemove';
import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useQueryState,
} from 'erxes-ui';

export const TemplateCategoryMoreColumn = (props: CellContext<TemplateCategory, unknown>) => {
  const category = props.row.original;

  const [, setCategoryId] = useQueryState<string>('categoryId');

  const { templateCategoryRemove } = useTemplateCategoryRemove();

  const handleEdit = () => {
    setCategoryId(category._id);
  };

  const handleDelete = () => {
    templateCategoryRemove({
      variables: { _ids: [category._id] }
    });
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

export const templateCategoryMoreColumn: ColumnDef<any> = {
  id: 'more',
  cell: TemplateCategoryMoreColumn,
  size: 33,
};
