import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import List from '../components/invoice/List';
import { queries } from '../graphql';
import {
  InvoicesQueryResponse,
  InvoicesTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  invoicesQuery: InvoicesQueryResponse;
  invoicesTotalCountQuery: InvoicesTotalCountQueryResponse;
} & Props;

class InvoiceListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      mergeProductLoading: false
    };
  }

  render() {
    const { queryParams, invoicesQuery, invoicesTotalCountQuery } = this.props;

    if (invoicesQuery.loading || invoicesTotalCountQuery.loading) {
      return false;
    }

    const invoices = invoicesQuery.invoices || [];

    const counts = invoicesTotalCountQuery.invoicesTotalCount || {
      total: 0
    };

    const updatedProps = {
      ...this.props,
      queryParams,
      invoices,
      loading: invoicesQuery.loading,
      searchValue: this.props.queryParams.searchValue || '',
      counts
    };

    const invoiceList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.invoicesQuery.refetch();
    };

    return <Bulk content={invoiceList} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, InvoicesQueryResponse, { page: number; perPage: number }>(
      queries.invoices,
      {
        name: 'invoicesQuery',
        options: ({ queryParams }) => ({
          variables: {
            searchValue: queryParams.searchValue,
            page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
            perPage: queryParams.perPage
              ? parseInt(queryParams.perPage, 10)
              : 10,
            kind: queryParams.kind,
            status: queryParams.status
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, InvoicesTotalCountQueryResponse>(
      queries.invoicesTotalCount,
      {
        name: 'invoicesTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: {
            searchValue: queryParams.searchValue,
            kind: queryParams.kind,
            status: queryParams.status
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(InvoiceListContainer)
);
