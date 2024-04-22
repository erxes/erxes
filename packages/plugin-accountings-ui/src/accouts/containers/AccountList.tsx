import { gql, useQuery } from '@apollo/client';
import { IAccountsResponse, accountQuery } from '../graphql/query';
import React, { useMemo } from 'react';
import { __ } from '@erxes/ui/src';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader'
import Pagination from '@erxes/ui/src/components/pagination/Pagination'
import Wrapper from '@erxes/ui/src/layout/components/Wrapper'

interface IProps {
  navigate: any;
  queryParams: any;
}

export const breadcrumb = [
  { title: __('Accountings'), link: '/accountings' },
  { title: __('Accounts') }
];

function AccountList({ queryParams }: IProps): React.ReactNode {
  const variables = useMemo(() => {
    return {};
  }, [queryParams]);

  const { data, loading } = useQuery<IAccountsResponse>(
    gql(accountQuery.accounts),
    {
      variables: variables
    }
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('List accounts')}
          breadcrumb={breadcrumb}
          queryParams={queryParams}
        />
      }
      content={
        <DataWithLoader
          data={()=><pre>{JSON.stringify(data?.accounts,null,2)}</pre>}
          loading={loading}
          count={100}
          emptyText="There is no data"
          emptyImage="/images/actions/5.svg"
        />
      }
      transparent={true}
      hasBorder={true}
      footer={<Pagination count={100} />}
    />
  );
}

export default AccountList;
