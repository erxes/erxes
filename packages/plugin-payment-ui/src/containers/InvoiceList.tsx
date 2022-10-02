import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/InvoiceList';
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

    const updatedProps = {
      ...this.props,
      queryParams,
      invoices,
      loading: invoicesQuery.loading,
      searchValue: this.props.queryParams.searchValue || '',
      invoicesTotalCount: invoicesTotalCountQuery.invoicesTotalCount || 0
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
      gql(queries.invoices),
      {
        name: 'invoicesQuery',
        options: ({ queryParams }) => ({
          variables: {
            searchValue: queryParams.searchValue,
            page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
            perPage: queryParams.perPage
              ? parseInt(queryParams.perPage, 10)
              : 10
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, InvoicesTotalCountQueryResponse>(
      gql(queries.invoicesTotalCount),
      {
        name: 'invoicesTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: {
            searchValue: queryParams.searchValue
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(InvoiceListContainer)
);
