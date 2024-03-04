import React from 'react';
import { gql, useQuery } from '@apollo/client';
import query from '../../graphql/queries';
import { IContract } from '../../types';

interface IProps {
  contract: IContract;
}

function SavingInfo(props: IProps) {
  const { data } = useQuery<any>(gql(query.getPolarisData), {
    variables: {
      method: 'getDepositBalance',
      data: { number: props.contract.number },
    },
  });
  return <>{data?.getPolarisData}</>;
}

export default SavingInfo;
