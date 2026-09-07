import { TDealSearchCategory } from '@/deals/types/dealSearch';
import { Badge, SearchOrderSelect, Tabs, TSearchSortOrder } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type TDealSearchToolbarProps = {
  category: TDealSearchCategory;
  hasDateFilter: boolean;
  hasNameFilter: boolean;
  hasNumberFilter: boolean;
  sortOrder: TSearchSortOrder;
  onCategoryChange: (category: TDealSearchCategory) => void;
  onSortOrderChange: (sortOrder: TSearchSortOrder) => void;
};

const isDealSearchCategory = (value: string): value is TDealSearchCategory =>
  value === 'date' || value === 'number' || value === 'name';

export const DealSearchToolbar = ({
  category,
  hasDateFilter,
  hasNameFilter,
  hasNumberFilter,
  sortOrder,
  onCategoryChange,
  onSortOrderChange,
}: TDealSearchToolbarProps) => {
  const { t } = useTranslation('sales');
  const handleCategoryChange = (value: string) => {
    if (isDealSearchCategory(value)) onCategoryChange(value);
  };

  return (
    <div className="flex items-center border-b">
      <Tabs
        className="min-w-0 flex-1"
        value={category}
        onValueChange={handleCategoryChange}
      >
        <Tabs.List
          variant="underline"
          className="flex w-full justify-start gap-1 border-b-0 px-2 py-0"
        >
          <Tabs.Trigger
            className="h-8 px-2 text-xs transition-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:hover:bg-transparent"
            value="date"
          >
            {t('by-date', 'By date')}
            {hasDateFilter && <Badge variant="secondary">1</Badge>}
          </Tabs.Trigger>
          <Tabs.Trigger
            className="h-8 px-2 text-xs transition-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:hover:bg-transparent"
            value="number"
          >
            {t('by-deal-number', 'By deal number')}
            {hasNumberFilter && <Badge variant="secondary">1</Badge>}
          </Tabs.Trigger>
          <Tabs.Trigger
            className="h-8 px-2 text-xs transition-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:hover:bg-transparent"
            value="name"
          >
            {t('by-name', 'By name')}
            {hasNameFilter && <Badge variant="secondary">1</Badge>}
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <SearchOrderSelect
        value={sortOrder}
        newestLabel={t('newest-to-oldest', 'Newest to oldest')}
        oldestLabel={t('oldest-to-newest', 'Oldest to newest')}
        triggerClassName="mr-2 h-7 w-44 shrink-0 text-xs focus:shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
        onValueChange={onSortOrderChange}
      />
    </div>
  );
};
