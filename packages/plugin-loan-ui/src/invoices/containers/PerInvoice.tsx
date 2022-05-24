import { Alert, withProps } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import { IActivityLog } from '@erxes/ui/src/activityLogs/types';
import PerInvoice from '../components/PerInvoice';
import { mutations } from '../graphql';
import {
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  activity: IActivityLog;
};

type FinalProps = {
  invoicesMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

class InvoiceListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { invoicesRemove, activity } = this.props;

    const removeInvoices = ({ invoiceIds }) => {
      invoicesRemove({
        variables: { invoiceIds }
      })
        .then(() => {
          Alert.success('You successfully deleted a invoice');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      removeInvoices,
      contractId: activity.content.contractId
    };

    return <PerInvoice {...updatedProps} />;
  }
}

const generateOptions = () => ({
  refetchQueries: ['invoicesMain', 'activityLogs']
});

export default withProps<Props>(
  compose(
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.invoicesRemove),
      {
        name: 'invoicesRemove',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(InvoiceListContainer))
);
