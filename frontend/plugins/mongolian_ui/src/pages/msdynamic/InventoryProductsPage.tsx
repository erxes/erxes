import { useLocation } from 'react-router-dom';
import InventoryProductsContainer from '@/msdynamic/containers/InventoryProducts';

export const InventoryProductsPage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(new URLSearchParams(location.search));

  return <InventoryProductsContainer queryParams={queryParams} />;
};

export default InventoryProductsPage;
