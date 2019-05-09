import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, router, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { RemoveIndicator } from '.';
import { Histories } from '../components';
import { mutations, queries } from '../graphql';
import { ImportHistoriesQueryResponse, RemoveMutationResponse } from '../types';

type Props = {
  queryParams: any;
  setRemoveProgress: (removeIndicator: React.ReactNode) => void;
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
      setRemoveProgress
    } = this.props;

    if (!router.getParam(history, 'type')) {
      router.setParams(history, { type: 'customer' }, true);
    }

    const currentType = router.getParam(history, 'type');

    const removeHistory = historyId => {
      setRemoveProgress(<RemoveIndicator id={historyId} />);

      importHistoriesRemove({
        variables: { _id: historyId }
      })
        .then()
        .catch(e => {
          Alert.error(e.message);
          setRemoveProgress(null);
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
      {({ setRemoveProgress }) => (
        <HistoriesWithProps {...props} setRemoveProgress={setRemoveProgress} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
