import React from 'react';
import { gql, useQuery } from '@apollo/client';
import query from '../../graphql/queries';
import { IContract } from '../../types';
import { Table } from '@erxes/ui/src';
import { __ } from 'coreui/utils';

interface IProps {
  contract: IContract;
}

function CollateralsInfo(props: IProps) {
  const { data } = useQuery<any>(gql(query.getPolarisData), {
    variables: {
      method: 'getLoanCollaterals',
      data: { number: props.contract.number },
    },
  });
  return (
    <Table>
      <thead>
        <tr>
          <th>{__('Currency')}</th>
          <th>{__('Amount')}</th>
          <th>{__('Name')}</th>
        </tr>
      </thead>
      <tbody id="schedules">
        {data?.getPolarisData?.map((row) => (
          <tr key={`collateral${row.acntName}`}>
            <td>{row.useCurCode}</td>
            <td>{row.mainAmount}</td>
            <td>{row.acntName}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default CollateralsInfo;
