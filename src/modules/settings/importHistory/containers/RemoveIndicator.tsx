import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { RemoveIndicator } from '../components';
import { queries } from '../graphql';
import { ImportHistoryDetailQueryResponse } from '../types';

type Props = {
  id: string;
  importHistoryDetailQuery: ImportHistoryDetailQueryResponse;
  setRemoveProgress: (removeIndicator: React.ReactNode) => void;
};

class RemoveIndicatorContainer extends React.Component<Props> {
  render() {
    const { importHistoryDetailQuery } = this.props;

    const importHistory = importHistoryDetailQuery.importHistoryDetail || {};

    return <RemoveIndicator {...this.props} importHistory={importHistory} />;
  }
}

const RemoveIndicatorWithProps = withProps<{ id: string }>(
  compose(
    graphql<{ id: string }, ImportHistoryDetailQueryResponse, { _id: string }>(
      gql(queries.historyDetailForLoad),
      {
        name: 'importHistoryDetailQuery',
        options: ({ id }) => ({
          fetchPolicy: 'network-only',
          variables: {
            _id: id
          },
          pollInterval: 2000
        })
      }
    )
  )(RemoveIndicatorContainer)
);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ setRemoveProgress }) => (
        <RemoveIndicatorWithProps
          {...props}
          setRemoveProgress={setRemoveProgress}
        />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
