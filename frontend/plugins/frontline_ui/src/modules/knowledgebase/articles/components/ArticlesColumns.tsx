import {
  IconCalendarPlus,
  IconEye,
  IconFolder,
  IconLabelFilled,
  IconNotes,
  IconProgressCheck,
  IconUser,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import {
  Badge,
  Combobox,
  Command,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { articlesMoreColumn } from '@/knowledgebase/articles/components/ArticlesMoreColumn';
import { useEditArticleField } from '@/knowledgebase/articles/hooks/useArticleMutations';
import { ARTICLE_STATUSES } from '@/knowledgebase/constants';
import {
  kbColumn,
  kbDateColumn,
  KbTextCell,
} from '@/knowledgebase/shared/components/kbColumns';
import { SelectKbCategory } from '@/knowledgebase/shared/components/SelectKbCategory';
import { IArticle, KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

const statusVariant = (
  status: string,
): 'success' | 'destructive' | 'secondary' => {
  if (status === 'publish') return 'success';
  if (status === 'archived') return 'destructive';
  return 'secondary';
};

const TextCell = ({
  cell,
  field,
  placeholder,
  children,
}: {
  cell: Cell<IArticle, unknown>;
  field: 'title' | 'summary';
  placeholder?: string;
  children?: ReactNode;
}) => {
  const { editArticleField } = useEditArticleField();

  return (
    <KbTextCell
      cell={cell}
      scope={KnowledgeBaseHotKeyScope.ArticlesPage}
      field={field}
      placeholder={placeholder}
      onSave={(next) => editArticleField(cell.row.original, { [field]: next })}
    >
      {children}
    </KbTextCell>
  );
};

const TitleCell = ({
  cell,
  t,
}: {
  cell: Cell<IArticle, unknown>;
  t: TFunction;
}) => {
  const article = cell.row.original;
  const [, setEditId] = useQueryState<string>('editId');

  return (
    <TextCell
      cell={cell}
      field="title"
      placeholder={t('kb-untitled-article', 'Untitled article')}
    >
      <RecordTableInlineCell.Anchor onClick={() => setEditId(article._id)}>
        {article.title || t('kb-untitled-article', 'Untitled article')}
      </RecordTableInlineCell.Anchor>
    </TextCell>
  );
};

const StatusCell = ({
  cell,
  t,
}: {
  cell: Cell<IArticle, unknown>;
  t: TFunction;
}) => {
  const article = cell.row.original;
  const [open, setOpen] = useState(false);
  const { editArticleField } = useEditArticleField();
  const current = ARTICLE_STATUSES.find(
    (status) => status.value === article.status,
  );

  return (
    <PopoverScoped
      scope={clsx(KnowledgeBaseHotKeyScope.ArticlesPage, article._id, 'status')}
      open={open}
      onOpenChange={setOpen}
    >
      <RecordTableInlineCell.Trigger>
        <Badge variant={statusVariant(article.status)}>
          {current ? t(current.key, current.label) : article.status}
        </Badge>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Command>
          <Command.List>
            {ARTICLE_STATUSES.map((status) => (
              <Command.Item
                key={status.value}
                value={status.value}
                onSelect={() => {
                  editArticleField(article, { status: status.value });
                  setOpen(false);
                }}
              >
                {t(status.key, status.label)}
                <Combobox.Check checked={article.status === status.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const CategoryCell = ({
  cell,
  topicId,
}: {
  cell: Cell<IArticle, unknown>;
  topicId: string;
}) => {
  const article = cell.row.original;
  const { editArticleField } = useEditArticleField();

  return (
    <SelectKbCategory
      variant="table"
      topicId={topicId}
      value={article.categoryId}
      scope={clsx(
        KnowledgeBaseHotKeyScope.ArticlesPage,
        article._id,
        'categoryId',
      )}
      onValueChange={(categoryId) => editArticleField(article, { categoryId })}
    />
  );
};

const createArticlesColumns = (
  t: TFunction,
  topicId: string,
): ColumnDef<IArticle>[] => [
  articlesMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IArticle>,
  kbColumn<IArticle>({
    id: 'title',
    size: 300,
    label: t('title-label', 'Title'),
    icon: IconLabelFilled,
    render: (cell) => <TitleCell cell={cell} t={t} />,
  }),
  kbColumn<IArticle>({
    id: 'status',
    size: 140,
    label: t('status', 'Status'),
    icon: IconProgressCheck,
    render: (cell) => <StatusCell cell={cell} t={t} />,
  }),
  kbColumn<IArticle>({
    id: 'categoryId',
    size: 220,
    label: t('kb-category', 'Category'),
    icon: IconFolder,
    render: (cell) => <CategoryCell cell={cell} topicId={topicId} />,
  }),
  kbColumn<IArticle>({
    id: 'summary',
    size: 320,
    label: t('kb-summary', 'Summary'),
    icon: IconNotes,
    render: (cell) => (
      <TextCell
        cell={cell}
        field="summary"
        placeholder={t('kb-no-summary', 'No summary')}
      />
    ),
  }),
  kbColumn<IArticle>({
    id: 'viewCount',
    size: 120,
    label: t('kb-views', 'Views'),
    icon: IconEye,
    render: (cell) => (
      <RecordTableInlineCell>
        {(cell.getValue() as number) ?? 0}
      </RecordTableInlineCell>
    ),
  }),
  kbColumn<IArticle>({
    id: 'createdUser',
    size: 200,
    label: t('kb-created-by', 'Created by'),
    icon: IconUser,
    render: (cell) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            cell.row.original.createdUser?.details?.fullName ||
            cell.row.original.createdUser?.email ||
            '-'
          }
        />
      </RecordTableInlineCell>
    ),
  }),
  kbDateColumn<IArticle>({
    id: 'modifiedDate',
    label: t('updated-at', 'Updated at'),
    icon: IconCalendarPlus,
  }),
];

export const useArticlesColumns = (topicId: string): ColumnDef<IArticle>[] => {
  const { t } = useTranslation('frontline');

  return useMemo(() => createArticlesColumns(t, topicId), [t, topicId]);
};
