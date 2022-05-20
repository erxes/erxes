import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { IRouterProps } from '../../types';
import { withProps } from '../../utils';
import { queries } from '../graphql/index';
import InvoiceList from '../components/InvoiceList';

import withCurrentUser from '../../auth/containers/withCurrentUser';
import Spinner from '../../common/components/Spinner';

type Props = {
  qp: any;
  orientation: string;
  invoiceListQuery: any;
} & IRouterProps;

class InvoiceListContainer extends React.Component<Props> {
  render() {
    const { qp, invoiceListQuery } = this.props;

    if (qp && qp.id && invoiceListQuery.loading) {
      return <Spinner />;
    }

    return <InvoiceList invoices={invoiceListQuery.qpayInvoices} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.qpayInvoices), {
      name: 'invoiceListQuery',
      options: ({ qp }) => ({
        variables: { number: qp && qp.number },
        fetchPolicy: 'network-only'
      })
    })
  )(withCurrentUser(withRouter<Props>(InvoiceListContainer)))
);
