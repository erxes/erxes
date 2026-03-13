import { useLocation } from 'react-router-dom';
import InventoryPriceContainer from '@/msdynamic/containers/InventoryPrice';
import MsdynamicTopNav from '@/msdynamic/components/MsdynamicTopNav';

export const InventoryPricePage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(new URLSearchParams(location.search));

  return (
    <>
      <MsdynamicTopNav />
      <InventoryPriceContainer queryParams={queryParams} />
    </>
  );
};

export default InventoryPricePage;
