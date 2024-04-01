import React from 'react';
import { gql, useQuery } from '@apollo/client';
import query from '../../graphql/queries';
import { IContract } from '../../types';
import { FieldStyle, SidebarCounter, SidebarList } from '@erxes/ui/src';

interface IProps {
  contract: IContract;
}

function LoanInfo(props: IProps) {
  const { data } = useQuery<any>(gql(query.getPolarisData), {
    variables: {
      method: 'getLoanDetail',
      data: { number: props.contract.number },
    },
  });

  const renderRow = (label, value) => {
    if (!value) return <></>;
    return (
      <li>
        <FieldStyle>{`${label}`}</FieldStyle>
        <SidebarCounter>{data?.getPolarisData?.[value] || '-'}</SidebarCounter>
      </li>
    );
  };

  return (
    <SidebarList className="no-link">
      {renderRow('Lease Amount', 'approvAmount')}
      {renderRow('Balance Amount', 'princBalOn')}
      {renderRow('Start Date', 'startDate')}
      {renderRow('End Date', 'endDate')}
      {renderRow('Next Payment', 'nextSchdDate')}
      {renderRow('Leasing officer', 'acntManagerName')}
    </SidebarList>
  );
}

export default LoanInfo;
