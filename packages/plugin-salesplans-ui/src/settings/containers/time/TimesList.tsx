import * as compose from 'lodash.flowright';
import { gql, useQuery, useMutation } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../../graphql';
import {
  TimeProportionsQueryResponse,
  TimeProportionsRemoveMutationResponse,
  TimeProportionsCountQueryResponse,
} from '../../types';
import List from '../../components/time/TimesList';

type Props = {
  queryParams: any;
};

const TimesListContainer = (props: Props) => {
  const { queryParams } = props;

  const timeProportionQuery = useQuery<TimeProportionsQueryResponse>(
    gql(queries.timeProportions),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: 'network-only',
    },
  );

  const timeProportionCountQuery = useQuery<TimeProportionsCountQueryResponse>(
    gql(queries.timeProportionsCount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: 'network-only',
    },
  );

  const [timeProportionsRemove] =
    useMutation<TimeProportionsRemoveMutationResponse>(
      gql(mutations.timeProportionsRemove),
      {
        refetchQueries: ['timeProportions', 'timeProportionsCount'],
      },
    );

  // remove action
  const remove = ({ timeProportionIds }, emptyBulk) => {
    timeProportionsRemove({
      variables: { _ids: timeProportionIds },
    })
      .then(() => {
        emptyBulk();

        Alert.success('You successfully deleted a time proportions');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const timesList = (bulkProps) => {
    const timeProportions = timeProportionQuery?.data?.timeProportions || [];
    const totalCount =
      timeProportionCountQuery?.data?.timeProportionsCount || 0;
    const loading =
      timeProportionQuery.loading || timeProportionCountQuery.loading;

    const updatedProps = {
      ...props,
      queryParams,
      timeProportions,
      totalCount,
      loading,
      remove,
    };

    return <List {...bulkProps} {...updatedProps} />;
  };

  const refetch = () => {
    timeProportionQuery.refetch();
    timeProportionCountQuery.refetch();
  };

  return <Bulk content={timesList} refetch={refetch} />;
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  departmentId: queryParams.departmentId,
  branchId: queryParams.branchId,
  productCategoryId: queryParams.productCategoryId,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
});

export default TimesListContainer;
