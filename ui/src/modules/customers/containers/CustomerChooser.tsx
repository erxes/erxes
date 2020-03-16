import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, renderFullName, withProps } from 'modules/common/utils';
import ConformityChooser from 'modules/conformity/containers/ConformityChooser';
import React from 'react';
import { graphql } from 'react-apollo';
import CustomerForm from '../containers/CustomerForm';
import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  CustomersQueryResponse,
  ICustomer,
  ICustomerDoc
} from '../types';

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

  render() {
    const { data, customersQuery, customersAdd, search } = this.props;

    // add customer
    const addCustomer = ({ doc, callback }) => {
      customersAdd({
        variables: doc
      })
        .then(() => {
          customersQuery.refetch();

          Alert.success('You successfully added a customer');

          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

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
        relType: 'customer'
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
      add: addCustomer,
      newItem: this.state.newCustomer,
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
