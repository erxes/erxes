import { useLocation } from 'react-router-dom';
import InventoryCategoryContainer from '@/msdynamic/containers/InventoryCategory';

export const InventoryCategoryPage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(new URLSearchParams(location.search));

  return <InventoryCategoryContainer queryParams={queryParams} />;
};

export default InventoryCategoryPage;
