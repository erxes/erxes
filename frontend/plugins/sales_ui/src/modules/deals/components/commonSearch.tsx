import { DealSearchInput } from '@/deals/components/search/DealSearchInput';
import { DealSearchResults } from '@/deals/components/search/DealSearchResults';
import { DealSearchToolbar } from '@/deals/components/search/DealSearchToolbar';
import { useCommonDealSearch } from '@/deals/hooks/useCommonDealSearch';
import { TDealSearchCategory } from '@/deals/types/dealSearch';
import { IconSearch } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const CommonDealSearch = () => {
  const { t } = useTranslation('sales');
  const search = useCommonDealSearch();
  const placeholders: Record<TDealSearchCategory, string> = {
    date: t('search-deals-by-date', 'Search by date'),
    number: t('search-deals-by-number', 'Search by deal number, e.g. #0000'),
    name: t('search-deals-by-name', 'Search by name'),
  };

  return (
    <Dialog open={search.open} onOpenChange={search.setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          className="font-normal focus-visible:ring-0 focus-visible:outline-none"
        >
          <IconSearch className="size-4" />
          {t('search-deals')}
        </Button>
      </Dialog.Trigger>

      <Dialog.Content className="w-[calc(100vw-2rem)] max-h-[85vh] max-w-2xl gap-0 overflow-hidden border-0 p-0">
        <Dialog.Title className="sr-only">{t('search-deals')}</Dialog.Title>
        <Dialog.Description className="sr-only">
          {t(
            'search-deals-description',
            'Search deals by date, deal number, or name',
          )}
        </Dialog.Description>

        <DealSearchInput
          category={search.category}
          dateRange={search.dateRange}
          placeholders={placeholders}
          searches={search.searches}
          onDateRangeChange={search.setDateRange}
          onSearchChange={search.setActiveSearch}
        />
        <DealSearchToolbar
          category={search.category}
          hasDateFilter={Boolean(search.dateRange?.from)}
          hasNameFilter={search.nameSearchReady}
          hasNumberFilter={search.numberSearchReady}
          sortOrder={search.sortOrder}
          onCategoryChange={search.setCategory}
          onSortOrderChange={search.setSortOrder}
        />
        <DealSearchResults
          category={search.category}
          deals={search.deals}
          loading={search.loading}
          loadingMore={search.loadingMore}
          nameSearch={search.nameSearch}
          numberSearch={search.numberSearch}
          resultsReady={search.resultsReady}
          searchSettled={search.searchSettled}
          totalCount={search.totalCount}
          hasNextPage={search.pageInfo?.hasNextPage}
          loadMoreRef={search.loadMoreRef}
          onSelect={search.selectDeal}
        />
      </Dialog.Content>
    </Dialog>
  );
};
