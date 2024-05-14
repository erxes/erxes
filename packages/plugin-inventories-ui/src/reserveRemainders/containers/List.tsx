import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import ReserveRems from '../components/List';
import { Alert, router } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { mutations, queries } from '../graphql';
import { IReserveRem } from '../types';
import {
  ReserveRemsQueryResponse,
  ReserveRemsRemoveMutationResponse,
  ReserveRemsCountQueryResponse,
  ReserveRemsEditMutationResponse,
} from '../types';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  queryParams: any;
  type?: string;
};

const ReserveRemsContainer: React.FC<Props> = (props) => {
  const { queryParams } = props;

  const reserveRemQuery = useQuery<ReserveRemsQueryResponse>(
    gql(queries.reserveRems),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: 'network-only',
    },
  );

  const reserveRemsCountQuery = useQuery<ReserveRemsCountQueryResponse>(
    gql(queries.reserveRemsCount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: 'network-only',
    },
  );

  const [reserveRemEdit] = useMutation<ReserveRemsEditMutationResponse>(
    gql(mutations.reserveRemEdit),
  );
  const [reserveRemsRemove] = useMutation<ReserveRemsRemoveMutationResponse>(
    gql(mutations.reserveRemsRemove),
    { refetchQueries: getRefetchQueries() },
  );

  if (reserveRemQuery.loading || reserveRemsCountQuery.loading) {
    return <Spinner />;
  }

  // edit row action
  const edit = (doc: IReserveRem) => {
    reserveRemEdit({
      variables: { ...doc },
    })
      .then(() => {
        Alert.success('You successfully updated a labels');
        reserveRemQuery.refetch();
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  // remove action
  const remove = ({ reserveRemIds }, emptyBulk) => {
    reserveRemsRemove({
      variables: { _ids: reserveRemIds },
    })
      .then((removeStatus) => {
        emptyBulk();

        if (removeStatus && removeStatus.data) {
          removeStatus.data.reserveRemsRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        }
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchValue = props.queryParams.searchValue || '';
  const reserveRems =
    (reserveRemQuery.data && reserveRemQuery.data.reserveRems) || [];
  const totalCount =
    (reserveRemsCountQuery.data &&
      reserveRemsCountQuery.data.reserveRemsCount) ||
    0;

  const updatedProps = {
    ...props,
    searchValue,
    queryParams,
    reserveRems,
    totalCount,
    edit,
    remove,
  };

  const reserveRemList = (props) => (
    <ReserveRems {...updatedProps} {...props} />
  );

  const refetch = () => {
    reserveRemQuery.refetch();
  };

  return <Bulk content={reserveRemList} refetch={refetch} />;
};

const getRefetchQueries = () => {
  return ['reserveRems', 'reserveRemsCount'];
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  _ids: queryParams._ids,
  date: queryParams.date,
  searchValue: queryParams.searchValue,
  departmentId: queryParams.departmentId,
  branchId: queryParams.branchId,
  productId: queryParams.productId,
  productCategoryId: queryParams.productCategoryId,
  dateType: queryParams.dateType,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
});

export default ReserveRemsContainer;
