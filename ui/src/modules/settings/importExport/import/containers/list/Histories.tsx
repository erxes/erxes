import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import { Alert, router, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Histories from '../../components/list/Histories';
import { mutations, queries } from '../../graphql';
import {
  ImportHistoriesQueryResponse,
  RemoveMutationResponse
} from '../../../types';
import { Spinner } from 'erxes-ui';

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

  render() {
    const { historiesQuery, importHistoriesRemove, history } = this.props;

    const histories = historiesQuery.importHistories || {};
    const list = histories.list || [];

    if (historiesQuery.loading) {
      return <Spinner />;
    }

    if (list.length === 0) {
      historiesQuery.stopPolling();
    }

    if (list[0] && list[0].percentage === 100) {
      historiesQuery.stopPolling();
    }

    if (!router.getParam(history, 'type')) {
      router.setParams(history, { type: 'customer' }, true);
    }

    const currentType = router.getParam(history, 'type');

    const removeHistory = (historyId: string, contentType: string) => {
      importHistoriesRemove({
        variables: { _id: historyId, contentType }
      })
        .then(() => {
          if (historiesQuery) {
            historiesQuery.refetch();
            Alert.success('success');
          }
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      histories: histories.list || [],
      loading: historiesQuery.loading || this.state.loading,
      totalCount: histories.count || 0,
      removeHistory,
      currentType
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
      gql(queries.importHistories),
      {
        name: 'historiesQuery',
        options: ({ queryParams }) => ({
          fetchPolicy: 'network-only',
          variables: historiesListParams(queryParams),
          pollInterval: 3000
        })
      }
    ),
    graphql<
      Props,
      RemoveMutationResponse,
      { _id: string; contentType: string }
    >(gql(mutations.importHistoriesRemove), {
      name: 'importHistoriesRemove'
    })
  )(withRouter<FinalProps>(HistoriesContainer))
);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ showLoadingBar, closeLoadingBar }) => (
        <HistoriesWithProps
          {...props}
          showLoadingBar={showLoadingBar}
          closeLoadingBar={closeLoadingBar}
        />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
