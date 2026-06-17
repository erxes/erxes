import { useAtom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCheckPriceActions } from './useCheckPriceActions';
import {
  priceItemsAtom,
  checkResponseDataAtom,
  selectedFilterAtom,
  checkingAtom,
  syncingAtom,
} from '../states/checkPriceStates';
import { PriceStatus } from '../types/checkPrice';

export const useCheckPrice = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const brandId = useMemo(
    () => new URLSearchParams(search).get('brandId') || '',
    [search],
  );

  const priceItems = useAtomValue(priceItemsAtom);
  const checkResponseData = useAtomValue(checkResponseDataAtom);
  const [selectedFilter, setSelectedFilter] = useAtom(selectedFilterAtom);
  const checking = useAtomValue(checkingAtom);
  const syncing = useAtomValue(syncingAtom);
  const { checkPrice: checkPriceAction, syncPrices } = useCheckPriceActions();

  const setBrand = (nextBrandId: string) => {
    const params = new URLSearchParams(search);
    params.set('brandId', nextBrandId);
    navigate(`${pathname}?${params.toString()}`);
  };

  const checkPrice = () => checkPriceAction(brandId);
  const handleSync = () => syncPrices(brandId);

  const filteredItems = useMemo(
    () =>
      selectedFilter
        ? (priceItems || []).filter(
            (item) => item.status === selectedFilter,
          )
        : priceItems,
    [priceItems, selectedFilter],
  );

  const getCount = (status: PriceStatus): number =>
    priceItems?.filter((item) => item.status === status).length || 0;

  return {
    priceItems,
    filteredItems,
    checkResponseData,
    checking,
    syncing,
    selectedBrandId: brandId,
    selectedFilter,
    setSelectedFilter,
    setBrand,
    checkPrice,
    handleSync,
    getCount,
  };
};
