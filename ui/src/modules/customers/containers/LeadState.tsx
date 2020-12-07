import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { confirm } from 'modules/common/utils';
import routerUtils from 'modules/common/utils/router';
import LeadState from 'modules/customers/components/detail/LeadState';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { mutations } from '../graphql';
import {
  ChangeStateMutationResponse,
  ChangeStateMutationVariables,
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
  EditMutationResponse &
  ChangeStateMutationResponse &
  IRouterProps;

function CustomerChooser(props: FinalProps) {
  const { customersEdit, customer, history, customersChangeState } = props;

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

            routerUtils.setParams(history, { customersRefetch: true });
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

        routerUtils.setParams(history, { customersRefetch: true });
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

export default compose(
  // mutations
  graphql<Props, EditMutationResponse, ICustomerDoc>(
    gql(mutations.customersEdit),
    {
      name: 'customersEdit'
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
)(withRouter(CustomerChooser));
