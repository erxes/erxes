import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Chooser } from 'modules/common/components';
import { Alert, renderFullName } from 'modules/common/utils';
import { CustomerForm } from '../containers';
import { queries, mutations } from '../graphql';

const CustomerChooser = props => {
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

  const form = <CustomerForm action={addCustomer} />;

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
    form,
    renderName: renderFullName,
    add: addCustomer,
    datas: customersQuery.customers || []
  };

  return <Chooser {...updatedProps} />;
};

CustomerChooser.propTypes = {
  data: PropTypes.object.isRequired,
  customersQuery: PropTypes.object.isRequired,
  customersAdd: PropTypes.func.isRequired,
  search: PropTypes.func.isRequired
};

const WithQuery = compose(
  graphql(gql(queries.customers), {
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
  graphql(gql(mutations.customersAdd), {
    name: 'customersAdd'
  })
)(CustomerChooser);

export default class Wrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };

    this.search = this.search.bind(this);
  }

  search(value, loadmore) {
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
