import gql from 'graphql-tag';
import { Chooser } from 'modules/common/components';
import { Alert, renderFullName } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CustomerForm } from '../containers';
import { mutations, queries } from '../graphql';
import { ICustomerDoc } from '../types';

type Props = {
  customersQuery: any;
  customersAdd: (params: { variables: ICustomerDoc }) => Promise<any>;
  search: (value?: string) => void;
  perPage: number;
  closeModal: () => void;
};

const CustomerChooser = (props: WrapperProps & Props) => {
  const { data, customersQuery, customersAdd, search } = props;

  // add customer
  const addCustomer = ({ doc, callback }) => {
    customersAdd({
      variables: doc
    })
      .then(() => {
        customersQuery.refetch();

        Alert.success('Success');

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

const WithQuery = compose(
  graphql(gql(queries.customers), {
    name: 'customersQuery',
    options: ({
      searchValue,
      perPage
    }: {
      searchValue: string;
      perPage: number;
    }) => {
      return {
        variables: {
          searchValue,
          perPage
        }
      };
    }
  }),
  // mutations
  graphql(gql(mutations.customersAdd), {
    name: 'customersAdd'
  })
)(CustomerChooser);

type WrapperProps = {
  data: any;
  onSelect: (datas: any[]) => void;
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
  }

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
