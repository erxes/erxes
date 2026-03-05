import { useParams } from 'react-router-dom';
import PosOrderDetailContainer from '@/msdynamic/containers/PosOrderDetail';
import MsdynamicTopNav from '@/msdynamic/components/MsdynamicTopNav';

export const PosOrderDetailsPage = () => {
  const { id } = useParams();

  if (!id) return null;

  return (
    <>
      <MsdynamicTopNav />
      <PosOrderDetailContainer order={{ _id: id }} />
    </>
  );
};

export default PosOrderDetailsPage;