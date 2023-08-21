import { Alert, Bulk, router, withProps } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

import ClassificationHistoryList from '../components/ClassificationHistoryList';
import { mutations, queries } from '../graphql';
import {
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  classifications: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;
type State = {
  loading: boolean;
};

class ClassificationListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { classifications, classificationRemove } = this.props;

    const removeClassificationHistory = ({ classificationIds }, emptyBulk) => {
      classificationRemove({
        variables: { classificationIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a periodLock');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } = classifications.classifications || {};

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      classificationHistory: list,
      loading: classifications.loading || this.state.loading,
      removeClassificationHistory
    };

    const classificationHistoryList = props => {
      return <ClassificationHistoryList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.classifications.refetch();
    };

    return <Bulk content={classificationHistoryList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  variables: {
    ...router.generatePaginationParams(queryParams || {}),
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  },
  fetchPolicy: 'network-only'
});

const generateOptions = () => ({
  refetchQueries: ['classifications']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse, ListQueryVariables>(
      gql(queries.classifications),
      {
        name: 'classifications',
        options: { ...generateParams }
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.classificationRemove),
      {
        name: 'classificationRemove',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(ClassificationListContainer))
);
