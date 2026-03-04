import { IconImageInPicture, IconLabelFilled } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Avatar,
  Badge,
  RecordTable,
  RecordTableInlineCell,
  useSetQueryStateByKey,
} from 'erxes-ui';
import { templateCategoryMoreColumn } from './TemplateCategoryMoreCell';

export const templateCategoryColumns: ColumnDef<any>[] = [
  templateCategoryMoreColumn,
  RecordTable.checkboxColumn,
  {
    id: 'attachment',
    header: () => <RecordTable.InlineHead icon={IconImageInPicture} label="" />,
    accessorKey: 'attachment',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="flex justify-center items-center px-1">
          <Avatar>
            <Avatar.Image src={(cell.getValue() as any)?.url || ''} />
            <Avatar.Fallback>
              {cell.row.original.name.charAt(0)}
            </Avatar.Fallback>
          </Avatar>
        </RecordTableInlineCell>
      );
    },
    size: 32,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead label="Name" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const templateCategoryId = cell.row.original._id;

      const setQueryState = useSetQueryStateByKey();

      const handleClick = () => {
        if (!templateCategoryId) return;

        setQueryState('categoryId', templateCategoryId);
      };

      return (
        <RecordTableInlineCell>
          <Badge variant="secondary" onClick={handleClick}>{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => (
      <RecordTable.InlineHead label="Code" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'templateCount',
    accessorKey: 'templateCount',
    header: () => (
      <RecordTable.InlineHead label="Template Count" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as number}
        </RecordTableInlineCell>
      );
    },
  },
  // {
  //   id: 'parent',
  //   accessorKey: 'parent',
  //   header: () => (
  //     <RecordTable.InlineHead label="Parent" icon={IconLabelFilled} />
  //   ),
  //   cell: ({ cell }) => {
  //     const parent = (cell.getValue() || {}) as TemplateCategory;

  //     return <RecordTableInlineCell>{parent?.name}</RecordTableInlineCell>;
  //   },
  // },
];
