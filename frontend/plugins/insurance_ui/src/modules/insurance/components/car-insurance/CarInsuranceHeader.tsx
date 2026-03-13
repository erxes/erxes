import { IconCar } from '@tabler/icons-react';
import { GenericHeader } from '../shared';

export const CarInsuranceHeader = () => {
  return (
    <GenericHeader
      icon={<IconCar />}
      parentLabel="Insurance"
      parentLink="/insurance/products"
      currentLabel="Car Insurance"
    />
  );
};
