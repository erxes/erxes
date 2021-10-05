import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations } from '../../graphql';
import { RemoveMutationResponse, RemoveMutationVariables } from '../../types';
import { getRefetchQueries } from '../List';
import Confirmation from '../../components/forms/confirmation';
import ConfirmationPopup from '../../components/forms/confirmation/popup';

type Props = {
  when: boolean;
  id: string;
  name: string;
  history: any;
  queryParams: any;
  save: () => void;
};

type FinalProps = {} & Props & RemoveMutationResponse;

class ConfirmationContainer extends React.Component<FinalProps> {
  render() {
    const { automationsRemove, queryParams, when } = this.props;

    const removeAutomations = ({ automationIds }, navigateToNextLocation) => {
      automationsRemove({
        variables: { automationIds }
      })
        .then(() => {
          navigateToNextLocation();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      removeAutomations
    };

    return (
      <Confirmation when={when} {...updatedProps}>
        {(isOpen, onConfirm, onCancel) => (
          <ConfirmationPopup
            isOpen={isOpen}
            queryParams={queryParams}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        )}
      </Confirmation>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.automationsRemove),
      {
        name: 'automationsRemove',
        options: ({ queryParams }) => ({
          refetchQueries: getRefetchQueries(queryParams)
        })
      }
    )
  )(ConfirmationContainer)
);
