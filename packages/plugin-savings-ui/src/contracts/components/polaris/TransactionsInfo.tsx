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
  return renderTable(data?.getPolarisData);
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
  return renderTable(data?.getPolarisData);
}

function renderTable(data) {
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
        {data?.txns?.map((row) => (
          <tr key={`depositTr${row.postDate}`}>
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
