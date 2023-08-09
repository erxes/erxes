import * as compose from 'lodash.flowright';

import {
  AddMutationResponse,
  CustomersQueryResponse,
  ICustomer,
  ICustomerDoc
} from '../types';
import { mutations, queries } from '../graphql';
import { renderFullName, withProps } from '@erxes/ui/src/utils';

import CustomerForm from './CustomerForm';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { isEnabled } from '@erxes/ui/src/utils/core';

const ConformityChooser = asyncComponent(
  () =>
    isEnabled('cards') &&
    import(
      /* webpackChunkName: "ConformityChooser" */ '@erxes/ui-cards/src/conformity/containers/ConformityChooser'
    )
);

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  searchValue: string;
  perPage: number;
};

type FinalProps = {
  customersQuery: CustomersQueryResponse;
} & Props &
  AddMutationResponse;
class CustomerChooser extends React.Component<
  WrapperProps & FinalProps,
  { newCustomer?: ICustomer }
> {
  constructor(props) {
    super(props);

    this.state = {
      newCustomer: undefined
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newCustomer: undefined });
  };

  render() {
    if (!isEnabled('cards')) {
      return null;
    }

    const { data, customersQuery, search } = this.props;

    const getAssociatedCustomer = (newCustomer: ICustomer) => {
      this.setState({ newCustomer });
    };

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: data.name,
        datas: data.customers,
        mainTypeId: data.mainTypeId,
        mainType: data.mainType,
        relType: data.relType || 'customer'
      },
      search,
      clearState: () => search(''),
      title: 'Customer',
      renderName: renderFullName,
      renderForm: formProps => (
        <CustomerForm
          {...formProps}
          getAssociatedCustomer={getAssociatedCustomer}
        />
      ),
      newItem: this.state.newCustomer,
      resetAssociatedItem: this.resetAssociatedItem,
      datas: customersQuery.customers || [],
      refetchQuery: queries.customers
    };

    return <ConformityChooser {...updatedProps} />;
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props & WrapperProps,
      CustomersQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.customers), {
      name: 'customersQuery',
      options: ({ searchValue, perPage, data }) => {
        return {
          variables: {
            searchValue,
            perPage,
            mainType: data.mainType,
            mainTypeId: data.mainTypeId,
            isRelated: data.isRelated,
            relType: data.relType,
            sortField: 'createdAt',
            sortDirection: -1
          },
          fetchPolicy: data.isRelated ? 'network-only' : 'cache-first'
        };
      }
    }),
    // mutations
    graphql<Props, AddMutationResponse, ICustomerDoc>(
      gql(mutations.customersAdd),
      {
        name: 'customersAdd',
        options: () => {
          return {
            refetchQueries: ['customersMain', 'customers', 'customerCounts']
          };
        }
      }
    )
  )(CustomerChooser)
);

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    customers: ICustomer[];
    mainTypeId?: string;
    mainType?: string;
    relType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: ICustomer[]) => void;
  closeModal: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  {
    perPage: number;
    searchValue: string;
  }
> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20, searchValue: '' };
  }

  search = (value, loadmore) => {
    let perPage = 20;

    if (loadmore) {
      perPage = this.state.perPage + 20;
    }

    return this.setState({ perPage, searchValue: value });
  };

  render() {
    const { searchValue, perPage } = this.state;
    return (
      <WithQuery
        {...this.props}
        search={this.search}
        searchValue={searchValue}
        perPage={perPage}
      />
    );
  }
}
