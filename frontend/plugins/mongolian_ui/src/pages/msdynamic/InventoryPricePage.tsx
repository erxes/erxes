import { useLocation } from "react-router-dom";
import InventoryPriceContainer from "@/msdynamic/containers/InventoryPrice";

export const InventoryPricePage = () => {
  const location = useLocation();
  const queryParams = Object.fromEntries(
    new URLSearchParams(location.search)
  );

  return <InventoryPriceContainer queryParams={queryParams} />;
};

export default InventoryPricePage;