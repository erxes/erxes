import { useQuery, useMutation } from '@apollo/client';
import MainListComponent from '../components/ExchangeRates';
import { MainQueryResponse } from '../types';
import { queries, mutations } from '../graphql';
import { Spinner } from 'erxes-ui';

type Props = {
  queryParams: Record<string, string>;
};

const MainListContainer = ({ queryParams }: Props) => {
  const { data, loading } = useQuery<MainQueryResponse>(
    queries.exchangeRatesMain, // ✅ NO gql()
    {
      variables: {
        searchValue: queryParams.searchValue,
        page: Number(queryParams.page || 1),
        perPage: Number(queryParams.perPage || 20),
      },
      fetchPolicy: 'network-only',
    }
  );

  const list = data?.exchangeRatesMain?.list || [];
  const totalCount = data?.exchangeRatesMain?.totalCount || 0;

  const [removeExchangeRates] = useMutation(
    mutations.exchangeRatesRemove, // ✅ NO gql()
    {
      refetchQueries: ['exchangeRatesMain'], // ✅ STRING
    }
  );

  const deleteExchangeRates = async (
    rateIds: string[],
    callback: () => void
  ) => {
    try {
      await removeExchangeRates({ variables: { rateIds } });
      callback();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <MainListComponent
      queryParams={queryParams}
      rateList={list}
      totalCount={totalCount}
      loading={loading}
      deleteExchangeRates={deleteExchangeRates}
    />
  );
};

export default MainListContainer;
