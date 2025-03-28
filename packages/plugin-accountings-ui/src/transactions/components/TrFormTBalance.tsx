import { Table, __ } from '@erxes/ui/src';
import { IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { ITransaction } from '../types';
import { TR_SIDES } from '../../constants';

type Props = {
  balance: { dt: number, ct: number }
  transactions: ITransaction[];
  queryParams: IQueryParams;
};

const TrFormTBalance = (props: Props) => {
  const { transactions, balance } = props;

  const ptrIdByTr: any = {}// { [ptrId: string]: ITransaction[] } = {}
  let trIndex = 1;
  for (const tr of transactions) {
    trIndex += trIndex ? -1 : 1;
    if (!Object.keys(ptrIdByTr).includes(tr.ptrId || '')) {
      ptrIdByTr[tr.ptrId || ''] = {};
    }

    for (const detail of tr.details) {
      const accountId = detail.accountId || '';
      if (!Object.keys(ptrIdByTr[tr.ptrId || '']).includes(accountId)) {
        ptrIdByTr[tr.ptrId || ''][accountId] = {
          _id: tr._id,
          trIndex,
          number: tr.number,
          description: tr.description,
          account: detail.account,
          debit: 0,
          credit: 0,
        };
      }

      if (detail.side === TR_SIDES.DEBIT) {
        ptrIdByTr[tr.ptrId || ''][accountId].debit += detail.amount;
      } else {
        ptrIdByTr[tr.ptrId || ''][accountId].credit += detail.amount;
      }
    }
  }

  const renderTrRow = (data) => {
    return (
      <tr key={data._id} style={{ background: data.trIndex ? "#fbfbfb" : "" }}>
        <td>
          {data.account?.code} - {data.account?.name}
        </td>
        <td>
          {data.number}
        </td>
        <td>
          {data.description}
        </td>
        <td style={{ textAlign: 'right' }}>
          {(data.debit).toLocaleString()}
        </td>
        <td style={{ textAlign: 'right' }}>
          {(data.credit).toLocaleString()}
        </td>
        <td>

        </td>
      </tr>
    )
  }

  return (
    <Table>
      <thead>
        <tr>
          <td>Данс</td>
          <td>Баримт №</td>
          <td>Утга</td>
          <td>Дебет</td>
          <td>Кредит</td>
          <td>Actions</td>
        </tr>
      </thead>
      <tbody>
        {Object.keys(ptrIdByTr).map((ptrId) => {
          const perTrs = ptrIdByTr[ptrId];

          const accountIds = Object.keys(perTrs);

          return accountIds.map(accountId => {
            const perAccount = perTrs[accountId]
            return renderTrRow(perAccount)
          })
        })}
        <tr>
          <td>Нийт</td>
          <td></td>
          <td></td>
          <td style={{ textAlign: 'right' }}>{balance.dt.toLocaleString()}</td>
          <td style={{ textAlign: 'right' }}>{balance.ct.toLocaleString()}</td>
          <td></td>
        </tr>
      </tbody>
    </Table>
  );
};

export default TrFormTBalance;
