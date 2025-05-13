import React from 'react';
import PolarisList from '../components/polaris/PolarisList';
import { IContractDoc } from '../types';

type Props = {
  contract: IContractDoc;
};

const PolarisListContainer = (props: Props) => {
  const updatedProps = {
    ...props,
  };

  return <PolarisList {...updatedProps} />;
};

export default PolarisListContainer;
