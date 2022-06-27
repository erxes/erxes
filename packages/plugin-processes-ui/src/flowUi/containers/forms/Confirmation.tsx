import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations as flowMutations } from '../../../flow/graphql';
import Confirmation from '../../components/forms/confirmation';
import ConfirmationPopup from '../../components/forms/confirmation/popup';
import { flowsRemoveMutationResponse } from '../../../flow/types';

type Props = {
  when: boolean;
  id: string;
  name: string;
  history: any;
  queryParams: any;
  save: () => void;
};

type FinalProps = {} & Props & flowsRemoveMutationResponse;

class ConfirmationContainer extends React.Component<FinalProps> {
  render() {
    const { flowsRemove, queryParams, when } = this.props;

    const removeFlows = ({ flowIds }, navigateToNextLocation) => {
      flowsRemove({
        variables: { flowIds }
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
      removeFlows
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

const getRefetchQueries = () => {
  return [
    'flows',
    'jobCategories',
    'jobCategoriesTotalCount',
    'jobReferTotalCount',
    'productCountByTags'
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, flowsRemoveMutationResponse, { flowsIds: string[] }>(
      gql(flowMutations.flowsRemove),
      {
        name: 'flowsRemove',
        options
      }
    )
  )(ConfirmationContainer)
);
