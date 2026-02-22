import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from 'erxes-ui/components/card';
import { Input, Select } from 'erxes-ui';
import dayjs from 'dayjs';

import { IKhanbankStatement } from '../types';
import Row from './Row';

type Props = {
  statement: IKhanbankStatement;
  queryParams: any;
  loading: boolean;
  showLatest?: boolean;
};

const List = ({
  statement,
  queryParams,
  loading,
  showLatest,
}: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [type, setType] = useState(
    queryParams.type || 'all',
  );

  const totalCount =
    statement?.total?.count || 0;

  const transactions = useMemo(() => {
    if (!statement?.transactions)
      return [];

    switch (type) {
      case 'income':
        return statement.transactions.filter(
          (t) => t.amount > 0,
        );
      case 'outcome':
        return statement.transactions.filter(
          (t) => t.amount < 0,
        );
      default:
        return statement.transactions;
    }
  }, [type, statement]);

  const updateParams = (
    key: string,
    value: string,
  ) => {
    const searchParams = new URLSearchParams(
      location.search,
    );
    searchParams.set(key, value);

    navigate(
      `${location.pathname}?${searchParams.toString()}`,
    );
  };

  const headingText =
    totalCount > 0
      ? `${statement.endBalance.toLocaleString()} ${statement.currency}`
      : 'No transactions';

  return (
    <div className="space-y-6">
      {!showLatest && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {headingText}
          </h3>

          <div className="flex gap-3 items-center">
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                updateParams(
                  'type',
                  e.target.value,
                );
              }}
            >
              <option value="all">
                All
              </option>
              <option value="income">
                Income
              </option>
              <option value="outcome">
                Outcome
              </option>
            </Select>

            <Input
              type="date"
              value={
                queryParams.startDate || ''
              }
              onChange={(e) =>
                updateParams(
                  'startDate',
                  dayjs(
                    e.target.value,
                  ).format('YYYY-MM-DD'),
                )
              }
            />

            <Input
              type="date"
              value={
                queryParams.endDate || ''
              }
              onChange={(e) =>
                updateParams(
                  'endDate',
                  dayjs(
                    e.target.value,
                  ).format('YYYY-MM-DD'),
                )
              }
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-10">
          Loading transactions...
        </div>
      ) : transactions.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No transactions found for this period.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b">
              <tr className="text-left">
                <th className="px-4 py-3">
                  Date
                </th>
                <th className="px-4 py-3">
                  Description
                </th>
                <th className="px-4 py-3">
                  Begin Balance
                </th>
                <th className="px-4 py-3">
                  End Balance
                </th>
                <th className="px-4 py-3">
                  Amount
                </th>
                <th className="px-4 py-3">
                  Related Account
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(
                (transaction) => (
                  <Row
                    key={
                      transaction.record
                    }
                    transaction={
                      transaction
                    }
                  />
                ),
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default List;