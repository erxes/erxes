import { IconFolder, IconProgressCheck, type Icon } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArticlesTotalCount } from '@/knowledgebase/articles/components/ArticlesTotalCount';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';
import {
  ARTICLES_FILTER_ID,
  ARTICLE_STATUSES,
} from '@/knowledgebase/constants';
import {
  hasActiveFilters,
  KbFilterPopover,
  KbSearchFilterBar,
} from '@/knowledgebase/shared/components/KbFilter';
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

type TRenderCommand = (
  value: string | null,
  onValueChange: (next: string) => void,
) => ReactNode;

const QueryFilterView = ({
  queryKey,
  render,
}: {
  queryKey: string;
  render: TRenderCommand;
}) => {
  const { resetFilterState } = useFilterContext();
  const [value, setValue] = useQueryState<string>(queryKey);

  return (
    <Filter.View filterKey={queryKey}>
      {render(value, (next) => {
        setValue(next);
        resetFilterState();
      })}
    </Filter.View>
  );
};

const QueryFilterBar = ({
  queryKey,
  icon: BarIcon,
  label,
  display,
  render,
}: {
  queryKey: string;
  icon: Icon;
  label: string;
  display: (value: string | null) => ReactNode;
  render: TRenderCommand;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <BarIcon />
        {label}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={queryKey}>
            {display(value)}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          {render(value, (next) => {
            setValue(next);
            setOpen(false);
          })}
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const renderStatusCommand: TRenderCommand = (value, onValueChange) => (
  <StatusCommand value={value} onValueChange={onValueChange} />
);

const renderCategoryCommand =
  (topicId: string): TRenderCommand =>
  (value, onValueChange) =>
    (
      <CategoryCommand
        topicId={topicId}
        value={value}
        onValueChange={onValueChange}
      />
    );

const StatusFilterBar = () => {
  const { t } = useTranslation('frontline');

  return (
    <QueryFilterBar
      queryKey="status"
      icon={IconProgressCheck}
      label={t('status')}
      display={(status) => {
        const selected = ARTICLE_STATUSES.find((item) => item.value === status);

        return selected ? t(selected.key, selected.label) : status;
      }}
      render={renderStatusCommand}
    />
  );
};

const CategoryFilterBar = ({ topicId }: { topicId: string }) => {
  const { t } = useTranslation('frontline');
  const { categories } = useCategories(topicId);

  return (
    <QueryFilterBar
      queryKey="categoryId"
      icon={IconFolder}
      label={t('kb-category', 'Category')}
      display={(categoryId) =>
        (categories ?? []).find((category) => category._id === categoryId)
          ?.title || t('unnamed-category')
      }
      render={renderCategoryCommand(topicId)}
    />
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

  return (
    <Filter id={ARTICLES_FILTER_ID}>
      <Filter.Bar>
        <KbFilterPopover
          scope={KnowledgeBaseHotKeyScope.ArticlesPage}
          isFiltered={hasActiveFilters(queries)}
          items={
            <>
              <Filter.Item value="status">
                <IconProgressCheck />
                {t('status')}
              </Filter.Item>
              <Filter.Item value="categoryId">
                <IconFolder />
                {t('kb-category', 'Category')}
              </Filter.Item>
            </>
          }
          views={
            <>
              <QueryFilterView queryKey="status" render={renderStatusCommand} />
              <QueryFilterView
                queryKey="categoryId"
                render={renderCategoryCommand(topicId)}
              />
            </>
          }
        />

        <ArticlesTotalCount />

        <KbSearchFilterBar searchValue={searchValue} />
        {status && <StatusFilterBar />}
        {categoryId && <CategoryFilterBar topicId={topicId} />}
      </Filter.Bar>
    </Filter>
  );
};
