import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import queryString from 'query-string';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
// erxes
import Bulk from '@erxes/ui/src/components/Bulk';
import Alert from '@erxes/ui/src/utils/Alert';
import { router } from '@erxes/ui/src/utils';
// local
import ListComponent from '../components/List';
import { queries, mutations } from '../graphql';

function ListContainer() {
  const history = useHistory();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  // graphql
  const remainderProductsQuery: any = useQuery(gql(queries.remainderProducts), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      categoryId: queryParams.categoryId,
      searchValue: queryParams.searchValue,
      search: queryParams.search,
      departmentId: queryParams.departmentId,
      branchId: queryParams.branchId
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only'
  });

  const [remaindersUpdate] = useMutation(gql(mutations.remaindersUpdate), {
    refetchQueries: ['remainderProductsQuery']
  });

  const refetch = () => remainderProductsQuery.refetch();

  const handleSearch = (event: any) => {
    const searchValue = event.target.value;

    if (searchValue.length === 0) {
      return router.removeParams(history, 'searchValue');
    }

    router.setParams(history, { searchValue });
  };

  const handleFilter = (key: string, value: any) => {
    router.setParams(history, { [key]: value });
  };

  const clearFilter = () => {
    router.removeParams(history, ...Object.keys(queryParams));
  };

  const recalculate = (
    products: any[],
    departmentId: string,
    branchId: string,
    emptyBulk: () => void
  ) => {
    const productIds: string[] = [];

    products.forEach((product: any) => {
      productIds.push(product._id);
    });

    if (products.length === 0) {
      Alert.error('Select products!');
      return;
    }

    if (departmentId.length === 0) {
      Alert.error('Department is required!');
      return;
    }

    if (branchId.length === 0) {
      Alert.error('Branch is required!');
      return;
    }

    remaindersUpdate({
      variables: { productIds, departmentId, branchId }
    })
      .then(() => {
        emptyBulk();
        refetch();
        Alert.success('Request successful!');
      })
      .catch((error: any) => Alert.error(error.message));
  };

  const products =
    (remainderProductsQuery.data &&
      remainderProductsQuery.data.remainderProducts.products) ||
    [];

  const totalCount =
    (remainderProductsQuery.data &&
      remainderProductsQuery.data.remainderProducts.totalCount) ||
    0;

  const searchValue = queryParams.searchValue || '';
  const departmentId = queryParams.departmentId || '';
  const branchId = queryParams.branchId || '';

  const componentProps = {
    products,
    totalCount,
    loading: remainderProductsQuery.loading,
    searchValue,
    departmentId,
    branchId,
    recalculate,
    handleSearch,
    handleFilter,
    clearFilter
  };

  const renderContent = (bulkProps: any) => (
    <ListComponent {...componentProps} {...bulkProps} />
  );

  return <Bulk content={renderContent} refetch={refetch} />;
}

export default compose()(ListContainer);
