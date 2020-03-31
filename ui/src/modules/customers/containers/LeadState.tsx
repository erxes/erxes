import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert } from 'modules/common/utils';
import LeadState from 'modules/customers/components/detail/LeadState';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations } from '../graphql';
import {
  CustomersQueryResponse,
  EditMutationResponse,
  ICustomer,
  ICustomerDoc
} from '../types';

type Props = {
  customer: ICustomer;
};

type FinalProps = {
  customersQuery: CustomersQueryResponse;
} & Props &
  EditMutationResponse;

class CustomerChooser extends React.Component<FinalProps> {
  render() {
    const { customersEdit, customer } = this.props;

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

    return <LeadState customer={customer} saveState={saveState} />;
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
  )
)(CustomerChooser);
