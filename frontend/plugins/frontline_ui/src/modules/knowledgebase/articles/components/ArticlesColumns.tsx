import {
  IconCalendarPlus,
  IconCalendarTime,
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
  Avatar,
  Badge,
  Combobox,
  Command,
  PopoverScoped,
  readImage,
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
import {
  ARTICLE_STATUSES,
  QUICK_ARTICLE_STATUSES,
} from '@/knowledgebase/constants';
import {
  kbColumn,
  kbDateColumn,
  KbTextCell,
} from '@/knowledgebase/shared/components/kbColumns';
import { SelectKbCategory } from '@/knowledgebase/shared/components/SelectKbCategory';
import { IArticle, KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

const statusVariant = (
  status: string,
): 'success' | 'warning' | 'info' | 'secondary' => {
  if (status === 'publish') return 'success';
  if (status === 'draft') return 'warning';
  if (status === 'scheduled') return 'info';
  return 'secondary';
};

const formatSchedule = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
  const [, setEditId] = useQueryState<string>('editId');
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
          <span className="rounded-full size-1.5 bg-current" />
          {current ? t(current.key, current.label) : article.status}
          {article.status === 'scheduled' && article.scheduledDate && (
            <span className="font-normal">
              · {formatSchedule(article.scheduledDate)}
            </span>
          )}
        </Badge>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Command>
          <Command.List>
            {QUICK_ARTICLE_STATUSES.map((status) => (
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
            <Command.Separator />
            <Command.Item
              value="scheduled"
              onSelect={() => {
                setOpen(false);
                setEditId(article._id);
              }}
            >
              <IconCalendarTime />
              {t('kb-schedule', 'Schedule…')}
              <Combobox.Check checked={article.status === 'scheduled'} />
            </Command.Item>
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

const SummaryCell = ({
  cell,
  t,
}: {
  cell: Cell<IArticle, unknown>;
  t: TFunction;
}) => (
  <TextCell
    cell={cell}
    field="summary"
    placeholder={t('kb-no-summary', 'No summary')}
  >
    <TextOverflowTooltip
      value={cell.row.original.summary || t('kb-no-summary', 'No summary')}
      className="text-muted-foreground"
    />
  </TextCell>
);

const ViewsCell = ({ cell }: { cell: Cell<IArticle, unknown> }) => {
  const views = cell.row.original.viewCount ?? 0;

  return (
    <RecordTableInlineCell className="justify-end tabular-nums">
      <span className={clsx(!views && 'text-muted-foreground')}>
        {views.toLocaleString()}
      </span>
    </RecordTableInlineCell>
  );
};

const AuthorCell = ({ cell }: { cell: Cell<IArticle, unknown> }) => {
  const author = cell.row.original.createdUser;
  const name = author?.details?.fullName || author?.email || '-';

  return (
    <RecordTableInlineCell className="gap-2">
      {author && (
        <Avatar size="lg">
          <Avatar.Image src={readImage(author.details?.avatar, 200)} />
          <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
        </Avatar>
      )}
      <TextOverflowTooltip value={name} />
    </RecordTableInlineCell>
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
    size: 320,
    label: t('title-label', 'Title'),
    icon: IconLabelFilled,
    render: (cell) => <TitleCell cell={cell} t={t} />,
  }),
  kbColumn<IArticle>({
    id: 'categoryId',
    size: 200,
    label: t('kb-category', 'Category'),
    icon: IconFolder,
    render: (cell) => <CategoryCell cell={cell} topicId={topicId} />,
  }),
  kbColumn<IArticle>({
    id: 'status',
    size: 130,
    label: t('status', 'Status'),
    icon: IconProgressCheck,
    render: (cell) => <StatusCell cell={cell} t={t} />,
  }),
  kbColumn<IArticle>({
    id: 'viewCount',
    size: 100,
    label: t('kb-views', 'Views'),
    icon: IconEye,
    render: (cell) => <ViewsCell cell={cell} />,
  }),
  kbDateColumn<IArticle>({
    id: 'modifiedDate',
    label: t('updated-at', 'Updated at'),
    icon: IconCalendarPlus,
  }),
  kbColumn<IArticle>({
    id: 'createdUser',
    size: 180,
    label: t('kb-created-by', 'Created by'),
    icon: IconUser,
    render: (cell) => <AuthorCell cell={cell} />,
  }),
  kbColumn<IArticle>({
    id: 'summary',
    size: 360,
    label: t('kb-summary', 'Summary'),
    icon: IconNotes,
    render: (cell) => <SummaryCell cell={cell} t={t} />,
  }),
];

export const useArticlesColumns = (topicId: string): ColumnDef<IArticle>[] => {
  const { t } = useTranslation('frontline');

  return useMemo(() => createArticlesColumns(t, topicId), [t, topicId]);
};
