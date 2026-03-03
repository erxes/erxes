import { TemplateCategoriesInline } from '@/templates/components/category/TemplateCategoryInline';
import { templateMoreColumn } from '@/templates/components/TemplateMoreCell';
import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { IconLabelFilled } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { IUser, MembersInline } from 'ui-modules';

export const templateColumns: ColumnDef<any>[] = [
  templateMoreColumn,
  RecordTable.checkboxColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead label="Name" icon={IconLabelFilled} />
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
    id: 'contentType',
    accessorKey: 'contentType',
    header: () => (
      <RecordTable.InlineHead label="Type" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const contentType = (cell.getValue() || '') as string;

      const types = Array.from(new Set(contentType.split(':').filter(Boolean)));

      return (
        <RecordTableInlineCell>
          {types.map((type) => (
            <Badge variant="secondary" key={type}>
              {type}
            </Badge>
          ))}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'categories',
    accessorKey: 'categories',
    header: () => (
      <RecordTable.InlineHead label="Category" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const categories = (cell.getValue() || []) as TemplateCategory[];

      return (
        <RecordTableInlineCell>
          <TemplateCategoriesInline
            categories={categories}
            placeholder="No Category"
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: () => (
      <RecordTable.InlineHead label="Created By" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const member = (cell.getValue() || {}) as IUser;

      return (
        <RecordTableInlineCell>
          <MembersInline members={[member]} placeholder="No Member" />
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="Created At" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'updatedBy',
    accessorKey: 'updatedBy',
    header: () => (
      <RecordTable.InlineHead label="Updated By" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const member = (cell.getValue() || {}) as IUser;

      return (
        <RecordTableInlineCell>
          <MembersInline members={[member]} placeholder="Not updated yet" />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => (
      <RecordTable.InlineHead label="Updated At" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const updatedBy = cell.row.original.updatedBy || undefined;

      if (!updatedBy) {
        return <MembersInline placeholder="Not updated yet" className="px-3" />;
      }

      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
];
