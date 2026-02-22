import { gql, useQuery } from '@apollo/client';
import dayjs from 'dayjs';

import List from '../components/List';
import { queries } from '../graphql';
import { StatementQueryResponse } from '../types';
import { getRawAccountNumber } from '../../../../utils';

type Props = {
  queryParams: any;
  showLatest?: boolean;
};

export default function ListContainer({
  queryParams,
  showLatest,
}: Props) {
  let page = Number(queryParams.page) || 1;
  let perPage = Number(queryParams.perPage) || 20;

  let startDate = queryParams.startDate;
  let endDate = queryParams.endDate;

  if (showLatest) {
    page = 1;
    perPage = 10;

    startDate = dayjs()
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    endDate = dayjs().format('YYYY-MM-DD');
  }

  const { data, loading, error } =
    useQuery<StatementQueryResponse>(
      gql(queries.transactionsQuery),
      {
        variables: {
          page,
          perPage,
          accountNumber: getRawAccountNumber(
            queryParams.account,
          ),
          configId: queryParams._id,
          startDate,
          endDate,
        },
        fetchPolicy: 'network-only',
      },
    );

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground text-center py-10">
        Loading transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive p-4">
        {error.message}
      </div>
    );
  }

  const statement =
    data?.khanbankStatements;

  if (!statement) return null;

  return (
    <List
      queryParams={queryParams}
      showLatest={showLatest}
      loading={false}
      statement={statement}
    />
  );
}