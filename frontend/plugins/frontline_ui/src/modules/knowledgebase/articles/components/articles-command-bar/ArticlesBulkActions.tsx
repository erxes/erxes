import {
  IconFolderShare,
  IconProgressCheck,
  type Icon,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  Combobox,
  Command,
  Popover,
  RecordTable,
} from 'erxes-ui';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useBulkEditArticles } from '@/knowledgebase/articles/hooks/useArticleMutations';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';
import { sortCategoriesAsTree } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { QUICK_ARTICLE_STATUSES } from '@/knowledgebase/constants';
import { IArticle, IArticleDoc } from '@/knowledgebase/types';

const BulkActionPopover = ({
  icon: ActionIcon,
  label,
  disabled,
  children,
}: {
  icon: Icon;
  label: string;
  disabled: boolean;
  children: (close: () => void) => ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary" disabled={disabled}>
          <ActionIcon />
          {label}
        </Button>
      </Popover.Trigger>
      <Combobox.Content>{children(() => setOpen(false))}</Combobox.Content>
    </Popover>
  );
};

export const ArticlesBulkActions = () => {
  const { t } = useTranslation('frontline');
  const { topicId = '' } = useParams();
  const { table } = RecordTable.useRecordTable();
  const { categories, loading: categoriesLoading } = useCategories(topicId);
  const { bulkEditArticles, loading } = useBulkEditArticles();
  const categoryRows = useMemo(
    () => sortCategoriesAsTree(categories ?? []),
    [categories],
  );

  const articles = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original as IArticle);

  const apply = async (patch: Partial<IArticleDoc>, close: () => void) => {
    close();

    const done = await bulkEditArticles(articles, patch);

    if (done) {
      table.setRowSelection({});
    }
  };

  return (
    <>
      <BulkActionPopover
        icon={IconProgressCheck}
        label={t('kb-set-status', 'Set status')}
        disabled={loading}
      >
        {(close) => (
          <Command>
            <Command.List>
              {QUICK_ARTICLE_STATUSES.map((status) => (
                <Command.Item
                  key={status.value}
                  value={status.value}
                  onSelect={() => apply({ status: status.value }, close)}
                >
                  {t(status.key, status.label)}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        )}
      </BulkActionPopover>

      <BulkActionPopover
        icon={IconFolderShare}
        label={t('kb-move-to-category', 'Move to category')}
        disabled={loading}
      >
        {(close) => (
          <Command>
            <Command.Input
              placeholder={t('kb-search-categories', 'Search categories')}
            />
            <Command.List>
              <Combobox.Empty loading={categoriesLoading} />
              {categoryRows.map((category) => (
                <Command.Item
                  key={category._id}
                  value={`${category.title} ${category._id}`}
                  onSelect={() => apply({ categoryId: category._id }, close)}
                  style={{ paddingLeft: 8 + category.depth * 12 }}
                  className={cn(category.hasChildren && 'font-semibold')}
                >
                  {category.title || t('unnamed-category')}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        )}
      </BulkActionPopover>
    </>
  );
};
