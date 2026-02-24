import { useParams } from "react-router-dom";
import PosOrderDetailContainer from "@/msdynamic/containers/PosOrderDetail";

export const PosOrderDetailsPage = () => {
  const { id } = useParams();

  if (!id) return null;

  return <PosOrderDetailContainer order={{ _id: id }} />;
};

export default PosOrderDetailsPage;