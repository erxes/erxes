import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Empty, Input, Select, Spinner } from 'erxes-ui';
import Row from './Row';
import { IGolomtBankStatement } from '../../../types/ITransactions';

type Props = {
  statement: IGolomtBankStatement;
  queryParams: any;
  loading: boolean;
  showLatest?: boolean;
};

const List = ({ statement, queryParams, loading, showLatest }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const type = queryParams.type || 'all';

  const transactions = useMemo(() => {
    const list = statement?.statements || [];

    if (type === 'income') {
      return list.filter((t) => t.tranAmount > 0);
    }

    if (type === 'outcome') {
      return list.filter((t) => t.tranAmount < 0);
    }

    return list;
  }, [statement, type]);

  const totalCount = transactions.length;

  const headingText = totalCount > 0 ? statement.accountId : 'No transactions';

  const setParam = (params: Record<string, string | undefined>) => {
    const search = new URLSearchParams(location.search);

    Object.entries(params).forEach(([key, value]) => {
      if (!value) {
        search.delete(key);
      } else {
        search.set(key, value);
      }
    });

    navigate({ search: search.toString() }, { replace: true });
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm whitespace-nowrap">
        <thead className="border-b">
          <tr className="text-left">
            <th className="py-2 pr-4">{'Date'}</th>
            <th className="py-2 pr-4">{'Description'}</th>
            <th className="py-2 pr-4">{'Begin balance'}</th>
            <th className="py-2 pr-4">{'End balance'}</th>
            <th className="py-2 pr-4 text-right">{'Amount'}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <Row key={transaction.requestId} transaction={transaction} />
          ))}
        </tbody>
      </table>
    </div>
  );

  const filterBar = (
    <div className="flex flex-wrap gap-2 items-end">
      <Select value={type} onValueChange={(value) => setParam({ type: value })}>
        <Select.Trigger className="w-32">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {['all', 'income', 'outcome'].map((t) => (
            <Select.Item key={t} value={t}>
              {t}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>

      <Input
        type="date"
        value={queryParams.startDate || ''}
        onChange={(e) =>
          setParam({
            startDate: e.target.value
              ? dayjs(e.target.value).format('YYYY-MM-DD')
              : undefined,
          })
        }
      />

      <Input
        type="date"
        value={queryParams.endDate || ''}
        onChange={(e) =>
          setParam({
            endDate: e.target.value
              ? dayjs(e.target.value).format('YYYY-MM-DD')
              : undefined,
          })
        }
      />
    </div>
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-4">
      {!showLatest && (
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold">{headingText}</h3>
          {filterBar}
        </div>
      )}

      {totalCount > 0 ? (
        renderTable()
      ) : (
        <Empty>
          <Empty.Header>
            <Empty.Title>{'No data found'}</Empty.Title>
            <Empty.Description>
              {'No transactions found for this period'}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      )}

      {!showLatest && totalCount > 0 && (
        <div className="text-xs text-muted-foreground">
          {'Total'}: {totalCount}
        </div>
      )}
    </div>
  );
};

export default List;
