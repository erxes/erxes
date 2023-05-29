import * as compose from 'lodash.flowright';

import { Alert, __ } from '@erxes/ui/src/utils';
import {
  ChangeStateMutationResponse,
  ChangeStateMutationVariables,
  CustomersQueryResponse,
  EditMutationResponse,
  ICustomer,
  ICustomerDoc
} from '../types';

import LeadState from '../components/LeadState';
import React from 'react';
import { confirm } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '@erxes/ui-contacts/src/customers/graphql';

type Props = {
  customer: ICustomer;
};

type FinalProps = {
  customersQuery: CustomersQueryResponse;
} & Props &
  EditMutationResponse &
  ChangeStateMutationResponse;

class CustomerChooser extends React.Component<FinalProps> {
  render() {
    const { customersEdit, customer, customersChangeState } = this.props;

    const changeState = (value: string) => {
      confirm(__('Are your sure you want to convert lead to customer?')).then(
        () =>
          customersChangeState({
            variables: {
              _id: customer._id,
              value
            }
          })
            .then(() => {
              Alert.success('You successfully converted to customer');
            })
            .catch(e => {
              Alert.error(e.message);
            })
      );
    };

    const saveState = (state: string) => {
      customersEdit({
        variables: { _id: customer._id, leadStatus: state }
      })
        .then(() => {
          Alert.success('You successfully updated state');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    return (
      <LeadState
        customer={customer}
        saveState={saveState}
        changeCustomerState={changeState}
      />
    );
  }
}

export default compose(
  // mutations
  graphql<Props, EditMutationResponse, ICustomerDoc>(
    gql(mutations.customersEdit),
    {
      name: 'customersEdit',
      options: () => {
        return {
          refetchQueries: ['customersMain', 'customers']
        };
      }
    }
  ),
  graphql<Props, ChangeStateMutationResponse, ChangeStateMutationVariables>(
    gql(mutations.customersChangeState),
    {
      name: 'customersChangeState',
      options: {
        refetchQueries: ['customersMain', 'customerCounts', 'customerDetail']
      }
    }
  )
)(CustomerChooser);
