import {
  IconCalendarPlus,
  IconFileText,
  IconHash,
  IconLabelFilled,
  IconNotes,
  IconPhoto,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useQueryState,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { categoriesMoreColumn } from '@/knowledgebase/categories/components/CategoriesMoreColumn';
import { useEditCategoryField } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { TCategoryRow } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { IconPicker } from '@/knowledgebase/shared/components/IconPicker';
import { KbInlineTextCell } from '@/knowledgebase/shared/components/KbInlineTextCell';
import { ICategoryDoc, KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

const cellScope = (category: TCategoryRow, field: string) =>
  clsx(KnowledgeBaseHotKeyScope.CategoriesPage, category._id, field);

const TextCell = ({
  cell,
  field,
  placeholder,
  children,
}: {
  cell: Cell<TCategoryRow, unknown>;
  field: 'title' | 'description' | 'code';
  placeholder?: string;
  children?: ReactNode;
}) => {
  const category = cell.row.original;
  const { topicId = '' } = useParams();
  const { editCategoryField } = useEditCategoryField(topicId);
  const patch = (next: string): Partial<ICategoryDoc> => ({ [field]: next });

  return (
    <KbInlineTextCell
      value={(cell.getValue() as string) || ''}
      placeholder={placeholder}
      scope={cellScope(category, field)}
      onSave={(next) => editCategoryField(category, patch(next))}
    >
      {children}
    </KbInlineTextCell>
  );
};

const TitleCell = ({
  cell,
  t,
}: {
  cell: Cell<TCategoryRow, unknown>;
  t: TFunction;
}) => {
  const category = cell.row.original;
  const [, setEditId] = useQueryState<string>('editId');

  return (
    <TextCell cell={cell} field="title" placeholder={t('unnamed-category')}>
      <span
        className="flex gap-1 items-center"
        style={{ paddingLeft: category.depth * 12 }}
      >
        <RecordTableInlineCell.Anchor onClick={() => setEditId(category._id)}>
          {category.title || t('unnamed-category')}
        </RecordTableInlineCell.Anchor>
      </span>
    </TextCell>
  );
};

const IconCell = ({ cell }: { cell: Cell<TCategoryRow, unknown> }) => {
  const category = cell.row.original;
  const { topicId = '' } = useParams();
  const { editCategoryField } = useEditCategoryField(topicId);

  return (
    <IconPicker
      variant="table"
      scope={cellScope(category, 'icon')}
      value={category.icon}
      onChange={(icon) => editCategoryField(category, { icon })}
    />
  );
};

const createCategoriesColumns = (t: TFunction): ColumnDef<TCategoryRow>[] => [
  categoriesMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<TCategoryRow>,
  {
    id: 'title',
    accessorKey: 'title',
    size: 280,
    header: () => (
      <RecordTable.InlineHead
        label={t('title-label', 'Title')}
        icon={IconLabelFilled}
      />
    ),
    cell: ({ cell }) => <TitleCell cell={cell} t={t} />,
  },
  {
    id: 'description',
    accessorKey: 'description',
    size: 320,
    header: () => (
      <RecordTable.InlineHead
        label={t('description', 'Description')}
        icon={IconNotes}
      />
    ),
    cell: ({ cell }) => (
      <TextCell
        cell={cell}
        field="description"
        placeholder={t('kb-no-description', 'No description')}
      />
    ),
  },
  {
    id: 'numOfArticles',
    accessorKey: 'numOfArticles',
    size: 140,
    header: () => (
      <RecordTable.InlineHead
        label={t('articles', 'Articles')}
        icon={IconFileText}
      />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">{(cell.getValue() as number) ?? 0}</Badge>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'icon',
    accessorKey: 'icon',
    size: 180,
    header: () => (
      <RecordTable.InlineHead label={t('icon', 'Icon')} icon={IconPhoto} />
    ),
    cell: ({ cell }) => <IconCell cell={cell} />,
  },
  {
    id: 'code',
    accessorKey: 'code',
    size: 160,
    header: () => (
      <RecordTable.InlineHead label={t('kb-code', 'Code')} icon={IconHash} />
    ),
    cell: ({ cell }) => (
      <TextCell cell={cell} field="code" placeholder={t('kb-code', 'Code')} />
    ),
  },
  {
    id: 'createdDate',
    accessorKey: 'createdDate',
    size: 160,
    header: () => (
      <RecordTable.InlineHead
        label={t('created-at', 'Created at')}
        icon={IconCalendarPlus}
      />
    ),
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];

export const useCategoriesColumns = (): ColumnDef<TCategoryRow>[] => {
  const { t } = useTranslation('frontline');

  return useMemo(() => createCategoriesColumns(t), [t]);
};
