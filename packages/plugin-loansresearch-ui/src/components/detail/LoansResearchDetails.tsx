import { ILoanResearch } from '../../types';
import LeftSidebar from './LeftSidebar';
import React from 'react';
import RightSidebar from './RightSidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src';

type Props = {
  loansResearch: ILoanResearch;
};

const LoansResearchDetails = (props: Props) => {
  const { loansResearch } = props;

  const title = loansResearch.dealId || 'Unknown';

  const breadcrumb = [
    { title: __('Loans Research'), link: '/loansresearch' },
    { title },
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      leftSidebar={<LeftSidebar {...props} />}
      rightSidebar={<RightSidebar loansResearch={loansResearch} />}
      content={<></>}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default LoansResearchDetails;
