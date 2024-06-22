import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import React from 'react';

import BasicInfo from '../../containers/detail/BasicInfo';
import { IContract } from '../../types';

type Props = {
  contract: IContract;
};

const LeftSidebar = (props: Props) => {
  const { contract } = props;

  return (
    <Sidebar wide={true}>
      <BasicInfo contract={contract} />
    </Sidebar>
  );
};

export default LeftSidebar;
