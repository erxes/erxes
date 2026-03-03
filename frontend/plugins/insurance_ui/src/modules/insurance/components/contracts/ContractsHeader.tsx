import { IconFileText } from '@tabler/icons-react';
import { GenericHeader } from '../shared';

export const ContractsHeader = () => {
  return (
    <GenericHeader
      icon={<IconFileText />}
      parentLabel="Insurance"
      parentLink="/insurance/products"
      currentLabel="Contracts"
    />
  );
};
