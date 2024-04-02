import * as compose from 'lodash.flowright';
import { gql, useQuery, useMutation } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import List from '../../components/label/LabelsList';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../../graphql';
import {
  SPLabelsQueryResponse,
  SPLabelsRemoveMutationResponse,
  SPLabelsTotalCountQueryResponse,
} from '../../types';

type Props = {
  queryParams: any;
};

const ListContainer = (props: Props) => {
  const { queryParams } = props;

  const spLabelQuery = useQuery<SPLabelsQueryResponse>(gql(queries.spLabels), {
    variables: generateParams({ queryParams }),
    fetchPolicy: 'network-only',
  });

  const spLabelTotalCountQuery = useQuery<SPLabelsTotalCountQueryResponse>(
    gql(queries.spLabelsCount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: 'network-only',
    },
  );

  const [spLabelsRemove] = useMutation<SPLabelsRemoveMutationResponse>(
    gql(mutations.spLabelsRemove),
    {
      refetchQueries: ['spLabels', 'spLabelsCount'],
    },
  );

  const remove = ({ spLabelIds }, emptyBulk) => {
    spLabelsRemove({
      variables: { _ids: spLabelIds },
    })
      .then(() => {
        emptyBulk();

        Alert.success('You successfully deleted a labels');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const labelList = (bulkProps) => {
    const searchValue = queryParams.searchValue || '';
    const filterStatus = queryParams.filterStatus || '';
    const minMultiplier = queryParams.minMultiplier;
    const maxMultiplier = queryParams.maxMultiplier;

    const spLabels = spLabelQuery?.data?.spLabels || [];
    const totalCount = spLabelTotalCountQuery?.data?.spLabelsCount || 0;
    const loading = spLabelQuery.loading || spLabelTotalCountQuery.loading;

    const updatedProps = {
      ...props,
      queryParams,
      spLabels,
      totalCount,
      loading,
      remove,
      searchValue,
      filterStatus,
      minMultiplier,
      maxMultiplier,
    };
    return <List {...bulkProps} {...updatedProps} />;
  };

  const refetch = () => {
    spLabelQuery.refetch();
    spLabelTotalCountQuery.refetch();
  };

  return <Bulk content={labelList} refetch={refetch} />;
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  filterStatus: queryParams.filterStatus,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
  minMultiplier: Number(queryParams.minMultiplier) || undefined,
  maxMultiplier: Number(queryParams.maxMultiplier) || undefined,
});

export default ListContainer;
