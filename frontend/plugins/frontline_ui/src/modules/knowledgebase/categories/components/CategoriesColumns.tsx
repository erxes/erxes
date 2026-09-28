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
import { RecordTable, RecordTableInlineCell, useQueryState } from 'erxes-ui';
import { TFunction } from 'i18next';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { categoriesMoreColumn } from '@/knowledgebase/categories/components/CategoriesMoreColumn';
import { useEditCategoryField } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { TCategoryRow } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { IconPicker } from '@/knowledgebase/shared/components/IconPicker';
import {
  kbColumn,
  kbCountColumn,
  kbDateColumn,
  KbTextCell,
} from '@/knowledgebase/shared/components/kbColumns';
import { KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

const useEditCategory = () => {
  const { topicId = '' } = useParams();

  return useEditCategoryField(topicId).editCategoryField;
};

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
  const editCategoryField = useEditCategory();

  return (
    <KbTextCell
      cell={cell}
      scope={KnowledgeBaseHotKeyScope.CategoriesPage}
      field={field}
      placeholder={placeholder}
      onSave={(next) => editCategoryField(cell.row.original, { [field]: next })}
    >
      {children}
    </KbTextCell>
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
  const editCategoryField = useEditCategory();

  return (
    <IconPicker
      variant="table"
      scope={clsx(
        KnowledgeBaseHotKeyScope.CategoriesPage,
        category._id,
        'icon',
      )}
      value={category.icon}
      onChange={(icon) => editCategoryField(category, { icon })}
    />
  );
};

const createCategoriesColumns = (t: TFunction): ColumnDef<TCategoryRow>[] => [
  categoriesMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<TCategoryRow>,
  kbColumn<TCategoryRow>({
    id: 'title',
    size: 280,
    label: t('title-label', 'Title'),
    icon: IconLabelFilled,
    render: (cell) => <TitleCell cell={cell} t={t} />,
  }),
  kbColumn<TCategoryRow>({
    id: 'description',
    size: 320,
    label: t('description', 'Description'),
    icon: IconNotes,
    render: (cell) => (
      <TextCell
        cell={cell}
        field="description"
        placeholder={t('kb-no-description', 'No description')}
      />
    ),
  }),
  kbCountColumn<TCategoryRow>({
    id: 'numOfArticles',
    label: t('articles', 'Articles'),
    icon: IconFileText,
    count: (category) => category.numOfArticles ?? 0,
  }),
  kbColumn<TCategoryRow>({
    id: 'icon',
    size: 180,
    label: t('icon', 'Icon'),
    icon: IconPhoto,
    render: (cell) => <IconCell cell={cell} />,
  }),
  kbColumn<TCategoryRow>({
    id: 'code',
    size: 160,
    label: t('kb-code', 'Code'),
    icon: IconHash,
    render: (cell) => (
      <TextCell cell={cell} field="code" placeholder={t('kb-code', 'Code')} />
    ),
  }),
  kbDateColumn<TCategoryRow>({
    id: 'createdDate',
    label: t('created-at', 'Created at'),
    icon: IconCalendarPlus,
  }),
];

export const useCategoriesColumns = (): ColumnDef<TCategoryRow>[] => {
  const { t } = useTranslation('frontline');

  return useMemo(() => createCategoriesColumns(t), [t]);
};
