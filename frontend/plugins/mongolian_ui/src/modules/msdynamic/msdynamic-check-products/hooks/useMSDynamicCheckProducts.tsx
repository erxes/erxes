import { gql, useQuery } from '@apollo/client';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  checkingAtom,
  productsAtom,
  productsDataAtom,
  selectedFilterAtom,
  syncingAtom,
} from '../states/msDynamicCheckProductsStates';
import { useMSDynamicConfigs } from '../../hooks/useMSDynamicConfigs';
import { MSDynamicBrand } from '../types/msDynamicCheckProduct';
import { useMSDynamicCheckProductsActions } from './useMSDynamicCheckProductsActions';

const BRANDS_QUERY = gql`
  query msdynamicCheckProductBrands {
    brands {
      list {
        _id
        name
      }
    }
  }
`;

type BrandsQueryData = {
  brands?: { list: MSDynamicBrand[] };
};

/** Check products hook managing brand, filter and product state */
export const useMSDynamicCheckProducts = () => {
  const products = useAtomValue(productsAtom);
  const productsData = useAtomValue(productsDataAtom);
  const [selectedFilter, setSelectedFilter] = useAtom(selectedFilterAtom);
  const checking = useAtomValue(checkingAtom);
  const syncing = useAtomValue(syncingAtom);
  const setProducts = useSetAtom(productsAtom);
  const setProductsData = useSetAtom(productsDataAtom);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(
    () => Object.fromEntries(new URLSearchParams(location.search)),
    [location.search],
  );
  const brandId = queryParams.brandId || 'noBrand';

  useEffect(() => {
    setProducts([]);
    setProductsData(null);
  }, [brandId, setProducts, setProductsData]);

  const { data: brandsData, loading: brandsLoading } =
    useQuery<BrandsQueryData>(BRANDS_QUERY);
  const { configsMap, loading: configsLoading } = useMSDynamicConfigs();

  const brands = brandsData?.brands?.list || [];
  const selectedBrand = brands.find(
    (brand) => brand._id === queryParams.brandId,
  );
  const filteredProducts = (products || []).filter(
    (product) => product.status === selectedFilter,
  );
  const syncableProducts = filteredProducts.filter(
    (product) => product.isSynced !== true,
  );
  const hasDynamicConfig = Boolean(configsMap.DYNAMIC?.[brandId]);
  const { checkProducts, syncProducts } = useMSDynamicCheckProductsActions({
    brandId,
    hasDynamicConfig,
    selectedFilter,
    syncableProducts,
  });

  /** Navigate to selected brand */
  const setBrand = (nextBrandId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('brandId', nextBrandId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  return {
    brands,
    brandsLoading: brandsLoading || configsLoading,
    selectedBrand,
    selectedBrandId: queryParams.brandId,
    selectedFilter,
    setSelectedFilter,
    products,
    productsData,
    filteredProducts,
    syncableProducts,
    checking,
    syncing,
    setBrand,
    checkProducts,
    syncProducts,
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
};
