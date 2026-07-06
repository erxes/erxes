import { useEffect, useMemo, useState } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { useQueryState } from 'erxes-ui';
import { useCheckCustomerActions } from './useCheckCustomerActions';
import {
  customerItemsAtom,
  customerFilterAtom,
  customerCheckingAtom,
  customerSyncingAtom,
} from '../states/checkCustomerStates';
import { CustomerStatus } from '../types/checkCustomer';

export interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: number; // using index as cursor
  endCursor: number;
  totalCount: number;
}

export const useCheckCustomer = () => {
  const [selectedBrandId, setSelectedBrandId] =
    useQueryState<string>('brandId');
  const brandId = selectedBrandId || 'noBrand';
  const allItems = useAtomValue(customerItemsAtom);
  const [filter, setFilter] = useAtom(customerFilterAtom);
  const checking = useAtomValue(customerCheckingAtom);
  const syncing = useAtomValue(customerSyncingAtom);
  const actions = useCheckCustomerActions(brandId);

  const { checkCustomers, syncCustomers } = actions;

  // pagination state (client‑side)
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [filter, allItems, brandId]);

  const filteredItems = useMemo(() => {
    if (!filter) return allItems;
    return allItems.filter((item) => item.status === filter);
  }, [allItems, filter]);

  const totalCount = filteredItems.length;
  const startIdx = currentPage * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalCount);
  const paginatedItems = filteredItems.slice(startIdx, endIdx);

  const pageInfo: PageInfo = {
    hasPreviousPage: currentPage > 0,
    hasNextPage: endIdx < totalCount,
    startCursor: startIdx,
    endCursor: endIdx - 1,
    totalCount,
  };

  const goNext = () => {
    if (pageInfo.hasNextPage) setCurrentPage((p) => p + 1);
  };
  const goPrev = () => {
    if (pageInfo.hasPreviousPage) setCurrentPage((p) => p - 1);
  };

  const syncableItems = useMemo(() => {
    return allItems.filter(
      (item) =>
        (item.status === 'UPDATE' ||
          item.status === 'CREATE' ||
          item.status === 'DELETE') &&
        !item.isSynced,
    );
  }, [allItems]);

  const getCount = (status: CustomerStatus) =>
    allItems.filter((i) => i.status === status).length;

  return {
    allItems,
    filteredItems,
    paginatedItems,
    pageInfo,
    goNext,
    goPrev,
    syncableItems,
    filter,
    setFilter,
    checking,
    syncing,
    brandId,
    setSelectedBrandId,
    checkCustomers,
    syncCustomers,
    getCount,
  };
};
