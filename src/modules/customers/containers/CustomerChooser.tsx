import gql from 'graphql-tag';
import Chooser from 'modules/common/components/Chooser';
import { Alert, renderFullName, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import CustomerForm from '../containers/CustomerForm';
import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  CustomersQueryResponse,
  ICustomer,
  ICustomerDoc,
  RelatedCustomersQueryResponse
} from '../types';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  searchValue: string;
  perPage: number;
  itemId?: string;
  itemKind?: string;
};

type FinalProps = {
  customersQuery: CustomersQueryResponse;
  relatedCustomersQuery: RelatedCustomersQueryResponse;
} & Props &
  AddMutationResponse;

const CustomerChooser = (props: WrapperProps & FinalProps) => {
  const {
    data,
    customersQuery,
    customersAdd,
    relatedCustomersQuery,
    search
  } = props;

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

  const datas =
    data.itemId && data.itemKind
      ? relatedCustomersQuery.relatedCustomers
      : customersQuery.customers;

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: data.name,
      datas: data.customers
    },
    search,
    clearState: () => search(''),
    title: 'Customer',
    renderName: renderFullName,
    renderForm: formProps => (
      <CustomerForm {...formProps} action={addCustomer} />
    ),
    add: addCustomer,
    datas: datas || []
  };

  return <Chooser {...updatedProps} />;
};

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props,
      CustomersQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.customers), {
      name: 'customersQuery',
      options: ({ searchValue, perPage }) => {
        return {
          variables: {
            searchValue,
            perPage
          }
        };
      }
    }),
    graphql<
      Props,
      RelatedCustomersQueryResponse,
      {
        searchValue: string;
        perPage: number;
        itemId?: string;
        itemKind?: string;
      }
    >(gql(queries.relatedCustomers), {
      name: 'relatedCustomersQuery',
      options: ({ searchValue, perPage, itemId, itemKind }) => {
        return {
          variables: {
            searchValue,
            perPage,
            itemId,
            itemKind
          }
        };
      }
    }),
    // mutations
    graphql<Props, AddMutationResponse, ICustomerDoc>(
      gql(mutations.customersAdd),
      {
        name: 'customersAdd'
      }
    )
  )(CustomerChooser)
);

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    customers: ICustomer[];
    itemId?: string;
    itemKind?: string;
  };
  onSelect: (datas: ICustomer[]) => void;
  closeModal: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  { perPage: number; searchValue: string; itemId?: string; itemKind?: string }
> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20, searchValue: '', itemId: '', itemKind: '' };
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
        itemId={this.props.data.itemId}
        itemKind={this.props.data.itemKind}
      />
    );
  }
}
