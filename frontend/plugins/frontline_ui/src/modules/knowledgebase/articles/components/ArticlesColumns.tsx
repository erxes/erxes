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
  RelativeDateDisplay,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { articlesMoreColumn } from '@/knowledgebase/articles/components/ArticlesMoreColumn';
import { useEditArticleField } from '@/knowledgebase/articles/hooks/useArticleMutations';
import { ARTICLE_STATUSES } from '@/knowledgebase/constants';
import { KbInlineTextCell } from '@/knowledgebase/shared/components/KbInlineTextCell';
import { SelectKbCategory } from '@/knowledgebase/shared/components/SelectKbCategory';
import {
  IArticle,
  IArticleDoc,
  KnowledgeBaseHotKeyScope,
} from '@/knowledgebase/types';

const cellScope = (article: IArticle, field: string) =>
  clsx(KnowledgeBaseHotKeyScope.ArticlesPage, article._id, field);

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
  const article = cell.row.original;
  const { editArticleField } = useEditArticleField();
  const patch = (next: string): Partial<IArticleDoc> => ({ [field]: next });

  return (
    <KbInlineTextCell
      value={(cell.getValue() as string) || ''}
      placeholder={placeholder}
      scope={cellScope(article, field)}
      onSave={(next) => editArticleField(article, patch(next))}
    >
      {children}
    </KbInlineTextCell>
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
      scope={cellScope(article, 'status')}
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
      scope={cellScope(article, 'categoryId')}
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
  {
    id: 'title',
    accessorKey: 'title',
    size: 300,
    header: () => (
      <RecordTable.InlineHead
        label={t('title-label', 'Title')}
        icon={IconLabelFilled}
      />
    ),
    cell: ({ cell }) => <TitleCell cell={cell} t={t} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    size: 140,
    header: () => (
      <RecordTable.InlineHead
        label={t('status', 'Status')}
        icon={IconProgressCheck}
      />
    ),
    cell: ({ cell }) => <StatusCell cell={cell} t={t} />,
  },
  {
    id: 'categoryId',
    accessorKey: 'categoryId',
    size: 220,
    header: () => (
      <RecordTable.InlineHead
        label={t('kb-category', 'Category')}
        icon={IconFolder}
      />
    ),
    cell: ({ cell }) => <CategoryCell cell={cell} topicId={topicId} />,
  },
  {
    id: 'summary',
    accessorKey: 'summary',
    size: 320,
    header: () => (
      <RecordTable.InlineHead
        label={t('kb-summary', 'Summary')}
        icon={IconNotes}
      />
    ),
    cell: ({ cell }) => (
      <TextCell
        cell={cell}
        field="summary"
        placeholder={t('kb-no-summary', 'No summary')}
      />
    ),
  },
  {
    id: 'viewCount',
    accessorKey: 'viewCount',
    size: 120,
    header: () => (
      <RecordTable.InlineHead label={t('kb-views', 'Views')} icon={IconEye} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as number) ?? 0}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'createdUser',
    accessorKey: 'createdUser',
    size: 200,
    header: () => (
      <RecordTable.InlineHead
        label={t('kb-created-by', 'Created by')}
        icon={IconUser}
      />
    ),
    cell: ({ cell }) => (
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
  },
  {
    id: 'modifiedDate',
    accessorKey: 'modifiedDate',
    size: 160,
    header: () => (
      <RecordTable.InlineHead
        label={t('updated-at', 'Updated at')}
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

export const useArticlesColumns = (topicId: string): ColumnDef<IArticle>[] => {
  const { t } = useTranslation('frontline');

  return useMemo(() => createArticlesColumns(t, topicId), [t, topicId]);
};
