import { IconFolder, IconProgressCheck, IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArticlesTotalCount } from '@/knowledgebase/articles/components/ArticlesTotalCount';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';
import {
  ARTICLES_FILTER_ID,
  ARTICLE_STATUSES,
} from '@/knowledgebase/constants';
import { KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

const StatusCommand = ({
  value,
  onValueChange,
}: {
  value: string | null;
  onValueChange: (status: string) => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Command>
      <Command.List>
        {ARTICLE_STATUSES.map((status) => (
          <Command.Item
            key={status.value}
            value={status.value}
            onSelect={() => onValueChange(status.value)}
          >
            {t(status.key, status.label)}
            <Combobox.Check checked={status.value === value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const CategoryCommand = ({
  topicId,
  value,
  onValueChange,
}: {
  topicId: string;
  value: string | null;
  onValueChange: (categoryId: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { categories, loading } = useCategories(topicId);

  return (
    <Command>
      <Command.Input
        placeholder={t('kb-search-categories', 'Search categories')}
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {(categories ?? []).map((category) => (
          <Command.Item
            key={category._id}
            value={category.title}
            onSelect={() => onValueChange(category._id)}
          >
            {category.title || t('unnamed-category')}
            <Combobox.Check checked={category._id === value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const StatusFilterView = () => {
  const { resetFilterState } = useFilterContext();
  const [status, setStatus] = useQueryState<string>('status');

  return (
    <Filter.View filterKey="status">
      <StatusCommand
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const CategoryFilterView = ({ topicId }: { topicId: string }) => {
  const { resetFilterState } = useFilterContext();
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');

  return (
    <Filter.View filterKey="categoryId">
      <CategoryCommand
        topicId={topicId}
        value={categoryId}
        onValueChange={(value) => {
          setCategoryId(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const StatusFilterBar = () => {
  const { t } = useTranslation('frontline');
  const [status, setStatus] = useQueryState<string>('status');
  const [open, setOpen] = useState(false);
  const selected = ARTICLE_STATUSES.find((item) => item.value === status);

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconProgressCheck />
        {t('status')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="status">
            {selected ? t(selected.key, selected.label) : status}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <StatusCommand
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const CategoryFilterBar = ({ topicId }: { topicId: string }) => {
  const { t } = useTranslation('frontline');
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');
  const [open, setOpen] = useState(false);
  const { categories } = useCategories(topicId);
  const selected = (categories ?? []).find(
    (category) => category._id === categoryId,
  );

  return (
    <Filter.BarItem queryKey="categoryId">
      <Filter.BarName>
        <IconFolder />
        {t('kb-category', 'Category')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="categoryId">
            {selected?.title || t('unnamed-category')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <CategoryCommand
            topicId={topicId}
            value={categoryId}
            onValueChange={(value) => {
              setCategoryId(value);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const ArticlesFilter = ({ topicId }: { topicId: string }) => {
  const { t } = useTranslation('frontline');
  const [queries] = useMultiQueryState<{
    searchValue: string;
    status: string;
    categoryId: string;
  }>(['searchValue', 'status', 'categoryId']);

  const { searchValue, status, categoryId } = queries || {};
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <Filter id={ARTICLES_FILTER_ID}>
      <Filter.Bar>
        <Filter.Popover scope={KnowledgeBaseHotKeyScope.ArticlesPage}>
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.Item value="searchValue" inDialog>
                    <IconSearch />
                    {t('search')}
                  </Filter.Item>
                  <Filter.Item value="status">
                    <IconProgressCheck />
                    {t('status')}
                  </Filter.Item>
                  <Filter.Item value="categoryId">
                    <IconFolder />
                    {t('kb-category', 'Category')}
                  </Filter.Item>
                </Command.List>
              </Command>
            </Filter.View>
            <StatusFilterView />
            <CategoryFilterView topicId={topicId} />
          </Combobox.Content>
        </Filter.Popover>

        <ArticlesTotalCount />

        {searchValue && (
          <Filter.BarItem queryKey="searchValue">
            <Filter.BarName>
              <IconSearch />
              {t('search')}
            </Filter.BarName>
            <Filter.BarButton filterKey="searchValue" inDialog>
              {searchValue}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        {status && <StatusFilterBar />}
        {categoryId && <CategoryFilterBar topicId={topicId} />}

        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
        </Filter.Dialog>
      </Filter.Bar>
    </Filter>
  );
};
