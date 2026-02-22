import { gql, useQuery } from '@apollo/client';
import dayjs from 'dayjs';

import { Spinner } from 'erxes-ui/components/spinner';

import List from '../components/List';
import { queries } from '../../../graphql';

import { IGolomtBankStatement } from '../../../types/ITransactions';

type StatementQueryResponse = {
  golomtBankStatements: IGolomtBankStatement;
};

type Props = {
  queryParams: any;
  showLatest?: boolean;
  refetch?: () => void;
};

export default function ListContainer({
  queryParams,
  showLatest = false,
}: Props) {
  const accountId = queryParams.account;
  const configId = queryParams._id;

  let startDate = queryParams.startDate;
  let endDate = queryParams.endDate;

  // Latest transactions mode (last 24 hours)
  if (showLatest) {
    startDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    endDate = dayjs().format('YYYY-MM-DD');
  }

  const { data, loading, error } = useQuery<StatementQueryResponse>(
    gql(queries.listQuery),
    {
      variables: {
        accountId,
        configId,
        startDate,
        endDate,
      },
      fetchPolicy: 'network-only',
    },
  );

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-sm text-destructive">{error.message}</div>;
  }

  const statement = data?.golomtBankStatements;

  if (!statement) {
    return null;
  }

  return (
    <List
      queryParams={queryParams}
      showLatest={showLatest}
      loading={false}
      statement={statement}
    />
  );
}
