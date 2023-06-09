import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import SPLabels from '../components/LabelsList';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import {
  SPLabelsQueryResponse,
  SPLabelsRemoveMutationResponse,
  SPLabelsTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  spLabelQuery: SPLabelsQueryResponse;
  spLabelTotalCountQuery: SPLabelsTotalCountQueryResponse;
} & Props &
  SPLabelsRemoveMutationResponse;

class SPLabelsContainer extends React.Component<FinalProps> {
  render() {
    const {
      spLabelQuery,
      spLabelTotalCountQuery,
      queryParams,
      spLabelsRemove
    } = this.props;

    if (spLabelQuery.loading || spLabelTotalCountQuery.loading) {
      return <Spinner />;
    }

    // remove action
    const remove = ({ spLabelIds }, emptyBulk) => {
      spLabelsRemove({
        variables: { _ids: spLabelIds }
      })
        .then(() => {
          emptyBulk();

          Alert.success('You successfully deleted a labels');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';
    const minMultiplier = this.props.queryParams.minMultiplier;
    const maxMultiplier = this.props.queryParams.maxMultiplier;

    const spLabels = spLabelQuery.spLabels || [];
    const totalCount = spLabelTotalCountQuery.spLabelsCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      spLabels,
      totalCount,
      remove,
      searchValue,
      filterStatus,
      minMultiplier,
      maxMultiplier
    };

    const labelList = props => <SPLabels {...updatedProps} {...props} />;

    const refetch = () => {
      this.props.spLabelQuery.refetch();
    };

    return <Bulk content={labelList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['spLabels'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  filterStatus: queryParams.filterStatus,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
  minMultiplier: Number(queryParams.minMultiplier) || undefined,
  maxMultiplier: Number(queryParams.maxMultiplier) || undefined
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, SPLabelsQueryResponse>(
      gql(queries.spLabels),
      {
        name: 'spLabelQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, SPLabelsTotalCountQueryResponse>(
      gql(queries.spLabelsCount),
      {
        name: 'spLabelTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, SPLabelsRemoveMutationResponse, { spLabelIds: string[] }>(
      gql(mutations.spLabelsRemove),
      {
        name: 'spLabelsRemove',
        options
      }
    )
  )(SPLabelsContainer)
);
