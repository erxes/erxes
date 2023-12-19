import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src';
import { MainQueryResponse, RemoveMutationResponse } from '../types';

import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import { IRouterProps } from '@erxes/ui/src/types';
import PerInvoice from '../components/PerInvoice';
import React from 'react';
import { withRouter } from 'react-router-dom';

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

export default withProps<Props>(
  compose()(withRouter<IRouterProps>(InvoiceListContainer))
);
