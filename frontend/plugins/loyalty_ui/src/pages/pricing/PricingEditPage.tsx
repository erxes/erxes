import { PricingEdit } from '@/pricing/edit-pricing/PricingEdit';
import { useParams } from 'react-router-dom';

export const PricingEditPage = () => {
  const { id } = useParams<{ id: string }>();

  return <PricingEdit key={id} id={id} />;
};
