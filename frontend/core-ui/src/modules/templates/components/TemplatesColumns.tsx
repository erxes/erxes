import { templateMoreColumn } from '@/templates/components/TemplateMoreCell';
import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { IconLabelFilled } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { TFunction } from 'i18next';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { IUser, MembersInline } from 'ui-modules';
import { TemplateCategoriesInline } from 'ui-modules/modules/templates/components/TemplateCategoryInline';
import { useTemplateTypes } from '../hooks/useTemplateTypes';
import { useTranslation } from 'react-i18next';

export const templateColumns = (t: TFunction): ColumnDef<any>[] => [
  templateMoreColumn,
  RecordTable.checkboxColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead label={t('name')} icon={IconLabelFilled} />
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
      <RecordTable.InlineHead label={t('type')} icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const { templateTypes } = useTemplateTypes();

      const contentType = (cell.getValue() || '') as string;

      const label =
        templateTypes.find((type) => type.type === contentType)?.label ||
        contentType;

      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">{label}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'categories',
    accessorKey: 'categories',
    header: () => (
      <RecordTable.InlineHead label={t('category')} icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const categories = (cell.getValue() || []) as TemplateCategory[];

      return (
        <RecordTableInlineCell>
          <TemplateCategoriesInline
            categories={categories}
            placeholder={t('no-category')}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: () => (
      <RecordTable.InlineHead label={t('created-by')} icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const member = cell.getValue() as IUser;

      if (!member) {
        return <RecordTableInlineCell>{t('import')}</RecordTableInlineCell>;
      }

      return (
        <RecordTableInlineCell>
          <MembersInline members={[member]} placeholder={t('no-member')} />
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label={t('created-at')} icon={IconLabelFilled} />
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
      <RecordTable.InlineHead label={t('updated-by')} icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const member = (cell.getValue() || {}) as IUser;

      return (
        <RecordTableInlineCell>
          <MembersInline
            members={[member]}
            placeholder={t('not-updated-yet')}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => (
      <RecordTable.InlineHead label={t('updated-at')} icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const updatedBy = cell.row.original.updatedBy || undefined;

      if (!updatedBy) {
        return (
          <MembersInline placeholder={t('not-updated-yet')} className="px-3" />
        );
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
