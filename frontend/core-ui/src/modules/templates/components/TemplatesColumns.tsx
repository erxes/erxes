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
import { useTranslation } from 'react-i18next';
import { IUser, MembersInline } from 'ui-modules';
import { TemplateCategoriesInline } from 'ui-modules/modules/templates/components/TemplateCategoryInline';
import { useTemplateTypes } from '../hooks/useTemplateTypes';

export const templateColumns: ColumnDef<any>[] = [
  templateMoreColumn,
  RecordTable.checkboxColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => {
      const { t } = useTranslation('templates');
      return <RecordTable.InlineHead label={t('name', 'Name')} icon={IconLabelFilled} />;
    },
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
    header: () => {
      const { t } = useTranslation('templates');
      return <RecordTable.InlineHead label={t('type', 'Type')} icon={IconLabelFilled} />;
    },
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
    header: () => {
      const { t } = useTranslation('templates');
      return <RecordTable.InlineHead label={t('category-label', 'Category')} icon={IconLabelFilled} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('templates');
      const categories = (cell.getValue() || []) as TemplateCategory[];

      return (
        <RecordTableInlineCell>
          <TemplateCategoriesInline
            categories={categories}
            placeholder={t('columns.no-category', 'No Category')}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: () => {
      const { t } = useTranslation('templates');
      return <RecordTable.InlineHead label={t('created-by', 'Created By')} icon={IconLabelFilled} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('templates');
      const member = cell.getValue() as IUser;

      if (!member) {
        return <RecordTableInlineCell>{t('import', 'Import')}</RecordTableInlineCell>;
      }

      return (
        <RecordTableInlineCell>
          <MembersInline members={[member]} placeholder={t('columns.no-member', 'No Member')} />
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => {
      const { t } = useTranslation('templates');
      return <RecordTable.InlineHead label={t('created-at', 'Created At')} icon={IconLabelFilled} />;
    },
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
    header: () => {
      const { t } = useTranslation('templates');
      return <RecordTable.InlineHead label={t('updated-by', 'Updated By')} icon={IconLabelFilled} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('templates');
      const member = (cell.getValue() || {}) as IUser;

      return (
        <RecordTableInlineCell>
          <MembersInline members={[member]} placeholder={t('columns.not-updated-yet', 'Not updated yet')} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => {
      const { t } = useTranslation('templates');
      return <RecordTable.InlineHead label={t('updated-at', 'Updated At')} icon={IconLabelFilled} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('templates');
      const updatedBy = cell.row.original.updatedBy || undefined;

      if (!updatedBy) {
        return <MembersInline placeholder={t('columns.not-updated-yet', 'Not updated yet')} className="px-3" />;
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
