import { useParams } from 'react-router-dom';
import { PricingEdit } from '@/pricing/edit-pricing/PricingEdit';

export const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <PricingEdit id={id} />;
};
