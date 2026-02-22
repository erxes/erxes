import { gql, useQuery } from '@apollo/client';

import Detail from '../components/Detail';
import queries from '../graphql/queries';
import { AccountDetailQueryResponse } from '../types';
import { getRawAccountNumber } from '../../../utils';

type Props = {
  queryParams: any;
};

const DetailContainer = ({ queryParams }: Props) => {
  const { _id, account } = queryParams;

  const { data, loading, error } =
    useQuery<AccountDetailQueryResponse>(
      gql(queries.detailQuery),
      {
        variables: {
          configId: _id,
          accountNumber: getRawAccountNumber(account),
        },
        fetchPolicy: 'network-only',
      },
    );

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="text-sm text-muted-foreground">
          Loading account details...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
        {error.message}
      </div>
    );
  }

  const accountDetail =
    data?.khanbankAccountDetail;

  if (!accountDetail) return null;

  return (
    <Detail
      queryParams={queryParams}
      account={accountDetail}
    />
  );
};

export default DetailContainer;