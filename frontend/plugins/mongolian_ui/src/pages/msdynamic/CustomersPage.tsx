import { useLocation } from "react-router-dom";
import CustomersContainer from '@/msdynamic/containers/Customers';

export const CustomersPage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(
    new URLSearchParams(location.search)
  );

  return <CustomersContainer queryParams={queryParams} />;
};

export default CustomersPage;