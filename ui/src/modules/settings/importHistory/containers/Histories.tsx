import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import { Alert, router, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Histories from '../components/Histories';
import { mutations, queries } from '../graphql';
import { ImportHistoriesQueryResponse, RemoveMutationResponse } from '../types';

type Props = {
  queryParams: any;
  showLoadingBar: (isRemovingImport: boolean) => void;
  closeLoadingBar: () => void;
  isDoneIndicatorAction: boolean;
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

  componentDidUpdate(prevProps: FinalProps) {
    const { isDoneIndicatorAction, historiesQuery } = this.props;

    if (
      historiesQuery &&
      isDoneIndicatorAction !== prevProps.isDoneIndicatorAction
    ) {
      historiesQuery.refetch();
    }
  }

  render() {
    const {
      historiesQuery,
      history,
      importHistoriesRemove,
      showLoadingBar,
      closeLoadingBar
    } = this.props;

    if (!router.getParam(history, 'type')) {
      router.setParams(history, { type: 'customer' }, true);
    }

    const currentType = router.getParam(history, 'type');

    const removeHistory = historyId => {
      // reset top indicator
      closeLoadingBar();

      localStorage.setItem('erxes_import_data', historyId);
      localStorage.setItem('erxes_import_data_type', 'remove');

      showLoadingBar(true);

      importHistoriesRemove({
        variables: { _id: historyId }
      })
        .then(() => {
          if (historiesQuery) {
            historiesQuery.refetch();
          }
        })
        .catch(e => {
          Alert.error(e.message);
          closeLoadingBar();
        });
    };

    const histories = historiesQuery.importHistories || {};

    const updatedProps = {
      ...this.props,
      histories: histories.list || [],
      loading: historiesQuery.loading || this.state.loading,
      removeHistory,
      currentType,
      totalCount: histories.count || 0
    };

    return <Histories {...updatedProps} />;
  }
}

const historiesListParams = queryParams => ({
  ...generatePaginationParams(queryParams),
  type: queryParams.type || 'customer'
});

const HistoriesWithProps = withProps<Props>(
  compose(
    graphql<Props, ImportHistoriesQueryResponse, { type: string }>(
      gql(queries.histories),
      {
        name: 'historiesQuery',
        options: ({ queryParams }) => ({
          fetchPolicy: 'network-only',
          variables: historiesListParams(queryParams)
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
      {({ showLoadingBar, closeLoadingBar, isDoneIndicatorAction }) => (
        <HistoriesWithProps
          {...props}
          showLoadingBar={showLoadingBar}
          closeLoadingBar={closeLoadingBar}
          isDoneIndicatorAction={isDoneIndicatorAction}
        />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
