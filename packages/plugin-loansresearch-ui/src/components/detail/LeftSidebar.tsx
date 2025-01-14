import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import { ILoanResearch } from '../../types';
import BasicInfo from '../../containers/detail/BasicInfo';

type Props = {
  loansResearch: ILoanResearch;
};

const LeftSidebar = (props: Props) => {
  const { loansResearch } = props;

  return (
    <Sidebar wide={true}>
      <BasicInfo loansResearch={loansResearch} />
    </Sidebar>
  );
};

export default LeftSidebar;
