import { useLocation } from 'react-router-dom';
import InventoryProductsContainer from '@/msdynamic/containers/InventoryProducts';
import MsdynamicTopNav from '@/msdynamic/components/MsdynamicTopNav';

export const InventoryProductsPage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(new URLSearchParams(location.search));

  return (
    <>
      <MsdynamicTopNav />
      <InventoryProductsContainer queryParams={queryParams} />
    </>
  );
};

export default InventoryProductsPage;
