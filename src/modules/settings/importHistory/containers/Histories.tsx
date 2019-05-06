import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, router, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Histories } from '../components';
import { mutations, queries } from '../graphql';
import { ImportHistoriesQueryResponse, RemoveMutationResponse } from '../types';

type Props = {
  queryParams: any;
  showLoadingBar: () => void;
};

type FinalProps = {
  historiesQuery: ImportHistoriesQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class HistoriesContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {
      historiesQuery,
      history,
      importHistoriesRemove,
      showLoadingBar
    } = this.props;

    if (!router.getParam(history, 'type')) {
      router.setParams(history, { type: 'customer' }, true);
    }

    const currentType = router.getParam(history, 'type');

    const removeHistory = historyId => {
      localStorage.setItem('erxes_import_data', historyId);
      showLoadingBar();

      importHistoriesRemove({
        variables: { _id: historyId }
      })
        .then(() => {
          Alert.success('You successfully removed all customers');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      histories: historiesQuery.importHistories || [],
      loading: historiesQuery.loading || this.state.loading,
      removeHistory,
      currentType
    };

    return <Histories {...updatedProps} />;
  }
}

const HistoriesWithProps = withProps<Props>(
  compose(
    graphql<Props, ImportHistoriesQueryResponse, { type: string }>(
      gql(queries.histories),
      {
        name: 'historiesQuery',
        options: ({ queryParams }) => ({
          fetchPolicy: 'network-only',
          variables: {
            type: queryParams.type || 'customer'
          }
        })
      }
    ),
    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.importHistoriesRemove),
      {
        name: 'importHistoriesRemove',
        options: {
          refetchQueries: ['importHistories']
        }
      }
    )
  )(withRouter<FinalProps>(HistoriesContainer))
);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ showLoadingBar }) => (
        <HistoriesWithProps {...props} showLoadingBar={showLoadingBar} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
