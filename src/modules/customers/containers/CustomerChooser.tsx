import gql from 'graphql-tag';
import { Chooser } from 'modules/common/components';
import { Alert, renderFullName, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CustomerForm } from '../containers';
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

type FinalProps = { customersQuery: CustomersQueryResponse } & Props &
  AddMutationResponse;

const CustomerChooser = (props: WrapperProps & FinalProps) => {
  const { data, customersQuery, customersAdd, search } = props;

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
    datas: customersQuery.customers || []
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
  data: { _id?: string; name: string; customers: ICustomer[] };
  onSelect: (datas: ICustomer[]) => void;
  closeModal: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  { perPage: number; searchValue: string }
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
