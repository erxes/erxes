import { DealsViewControl } from '@/deals/actionBar/components/DealViewControl';
import { SalesFilter } from '@/deals/actionBar/components/SalesFilter';
import ArchivedDeals from '@/deals/actionBar/components/ArchivedDeals';
import {
  SalesExport,
  SalesImport,
} from '~/modules/import-export/components/SalesImportExportActions';
import { SalesSearch } from './SalesSearch';
import { useSearchParams } from 'react-router-dom';

const ignoredExportFilterKeys = new Set(['salesItemId', 'tab']);

const parseFilterValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return value;
  }
};

const MainActionBar = () => {
  const [searchParams] = useSearchParams();

  const getFilters = () => {
    const filters: Record<string, any> = {};

    for (const [key, value] of searchParams.entries()) {
      if (ignoredExportFilterKeys.has(key)) {
        continue;
      }

      if (key === 'archivedOnly') {
        filters.noSkipArchive = value === 'true';
        continue;
      }

      if (key === 'boardId') {
        filters.boardIds = [value];
        continue;
      }

      if (key === 'productId') {
        const productIds = parseFilterValue(value);
        filters.productIds = Array.isArray(productIds)
          ? productIds
          : [productIds];
        continue;
      }

      filters[key] = parseFilterValue(value);
    }

    return filters;
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <SalesFilter />
      <div className="flex items-center gap-1">
        <SalesSearch />
        <SalesImport
          pluginName="sales"
          moduleName="deal"
          collectionName="deals"
          title="Import Deals"
          singularLabel="deal"
          pluralLabel="deals"
        />
        <SalesExport
          pluginName="sales"
          moduleName="deal"
          collectionName="deals"
          entityDisplayName="Deals"
          getFilters={getFilters}
        />
        <ArchivedDeals />
        <DealsViewControl />
      </div>
    </div>
  );
};

export default MainActionBar;
