import React from 'react';
import { gql, useQuery } from '@apollo/client';
import query from '../../graphql/queries';
import { IContract } from '../../types';
import { Table } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
interface IProps {
  contract: IContract;
}

function SavingTransactions(props: IProps) {
  const { data } = useQuery<any>(gql(query.getPolarisData), {
    variables: {
      method: 'getSavingTransactions',
      data: { number: props.contract.number },
    },
  });
  return (
    <Table>
      <thead>
        <tr>
          <th>{__('Date')}</th>
          <th>{__('Type')}</th>
          <th>{__('Saving Balance')}</th>
          <th>{__('Amount')}</th>
          <th>{__('Stored Interest')}</th>
          <th>{__('Total')}</th>
        </tr>
      </thead>
      <tbody id="schedules">
        {data?.getPolarisData?.txns?.map((row, index) => (
          <tr key={`depositTr${index}`}>
            <td>{row.postDate}</td>
            <td>{row.balance}</td>
            <td>{row.income}</td>
            <td>{row.outcome}</td>
            <td>{row.txnDesc}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function DepositTransactions(props: IProps) {
  const { data } = useQuery<any>(gql(query.getPolarisData), {
    variables: {
      method: 'getDepositStatement',
      data: {
        number: props.contract.number,
        startDate: '2023-12-31',
        endDate: '2024-12-31',
      },
    },
  });
  return (
    <Table>
      <thead>
        <tr>
          <th>{__('Date')}</th>
          <th>{__('Balance')}</th>
          <th>{__('income')}</th>
          <th>{__('outcome')}</th>
          <th>{__('description')}</th>
        </tr>
      </thead>
      <tbody id="schedules">
        {data?.getPolarisData?.txns?.map((row, index) => (
          <tr key={`depositTr${index}`}>
            <td>{row.postDate}</td>
            <td>{row.balance}</td>
            <td>{row.income}</td>
            <td>{row.outcome}</td>
            <td>{row.txnDesc}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function TransactionsInfo(props: IProps) {
  if (props.contract.isDeposit) return <DepositTransactions {...props} />;
  return <SavingTransactions {...props} />;
}

export default TransactionsInfo;
