import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import ImportIndicator from '../components/ImportIndicator';
import { mutations, queries } from '../graphql';
import {
  CancelMutationResponse,
  ImportHistoryDetailQueryResponse
} from '../types';

type Props = {
  id: string;
  close: () => void;
  importHistoryDetailQuery: ImportHistoryDetailQueryResponse;
  closeLoadingBar: () => void;
  doneIndicatorAction: () => void;
  isRemovingImport: boolean;
};

type State = {
  percentage: number;
  errors?: string[];
};

class ImportIndicatorContainer extends React.Component<
  Props & CancelMutationResponse,
  State
> {
  constructor(props) {
    super(props);

    this.state = {
      percentage: 0
    };
  }

  clearStorage() {
    // clear local storage
    localStorage.setItem('erxes_import_data', '');
    localStorage.setItem('erxes_import_data_type', '');
  }

  render() {
    const {
      importHistoryDetailQuery,
      importCancel,
      closeLoadingBar,
      isRemovingImport
    } = this.props;

    const importHistory = importHistoryDetailQuery.importHistoryDetail || {};
    const importHistoryError = importHistoryDetailQuery.error || {};
    const isImportRemoved = (importHistoryError.message || '').includes(
      'Import history not found'
    );
    const errors = this.state.errors;
    const percentage =
      Math.trunc(importHistory.percentage) || this.state.percentage;

    if (
      importHistoryDetailQuery.error ||
      importHistory.status === 'Done' ||
      percentage === 100
    ) {
      importHistoryDetailQuery.stopPolling();
    }

    const cancelImport = id => {
      confirm().then(() => {
        importCancel({
          variables: { _id: id }
        })
          .then(() => {
            Alert.success('You canceled importing action.');
            closeLoadingBar();
          })
          .catch(e => {
            Alert.error(e.message);
            closeLoadingBar();
          });
      });
    };

    return (
      <ImportIndicator
        {...this.props}
        percentage={percentage}
        importHistory={importHistory}
        cancel={cancelImport}
        isImportRemoved={isImportRemoved}
        isRemovingImport={isRemovingImport}
        errors={errors}
      />
    );
  }
}

const ImportIndicatorWithProps = withProps<{ id: string; close?: () => void }>(
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
          pollInterval: 3000
        })
      }
    ),
    graphql<Props, CancelMutationResponse, { _id: string }>(
      gql(mutations.importCancel),
      {
        name: 'importCancel'
      }
    )
  )(ImportIndicatorContainer)
);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ closeLoadingBar, isRemovingImport, doneIndicatorAction }) => (
        <ImportIndicatorWithProps
          {...props}
          closeLoadingBar={closeLoadingBar}
          isRemovingImport={isRemovingImport}
          doneIndicatorAction={doneIndicatorAction}
        />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
