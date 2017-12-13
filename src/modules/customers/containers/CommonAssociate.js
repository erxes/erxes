import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import {
  queries as companyQueries,
  mutations as companyMutations
} from 'modules/companies/graphql';
import { Alert } from 'modules/common/utils';
import { CommonAssociate } from '../components';

class CommonAssociateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
  }

  render() {
    const { data, customersAdd, companiesAdd } = this.props;
    let query = {};

    if (data.__typename === 'Customer') {
      query = this.props.companiesQuery;
    } else {
      query = this.props.customersQuery;
    }

    const search = (value, loadmore) => {
      if (loadmore) {
        query.refetch({
          searchValue: value,
          perPage: this.state.perPage + 20
        });
      } else {
        this.setState({ perPage: 20 });
        query.refetch({
          searchValue: value,
          perPage: this.state.perPage
        });
      }
    };

    // add customer
    const addCustomer = ({ doc, callback }) => {
      customersAdd({
        variables: doc
      })
        .then(() => {
          query.refetch();
          Alert.success('Success');
          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    // add company
    const addCompany = ({ doc, callback }) => {
      companiesAdd({
        variables: doc
      })
        .then(() => {
          query.refetch();
          Alert.success('Success');
          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    if (data.__typename === 'Customer') {
      const customerFullName = customer => {
        if (customer.firstName || customer.lastName) {
          return (customer.firstName || '') + ' ' + (customer.lastName || '');
        }
        return customer.email || customer.phone;
      };

      const type = 'companies';

      const updatedProps = {
        ...this.props,
        data: {
          _id: data._id,
          companies: data.companies,
          name: customerFullName(data)
        },
        type,
        search,
        add: addCompany,
        datas: query[type] || []
      };

      return <CommonAssociate {...updatedProps} />;
    }

    const type = 'customers';

    const updatedProps = {
      ...this.props,
      search,
      type,
      add: addCustomer,
      datas: query[type] || []
    };

    return <CommonAssociate {...updatedProps} />;
  }
}

CommonAssociateContainer.propTypes = {
  data: PropTypes.object.isRequired,
  save: PropTypes.func,
  customersQuery: PropTypes.object.isRequired,
  companiesQuery: PropTypes.object.isRequired,
  companiesAdd: PropTypes.func.isRequired,
  customersAdd: PropTypes.func.isRequired
};

export default compose(
  graphql(gql(queries.customers), {
    name: 'customersQuery',
    options: {
      variables: {
        perPage: 20
      }
    }
  }),
  graphql(gql(companyQueries.companies), {
    name: 'companiesQuery',
    options: {
      variables: {
        perPage: 20
      }
    }
  }),
  // mutations
  graphql(gql(mutations.customersAdd), {
    name: 'customersAdd'
  }),
  graphql(gql(companyMutations.companiesAdd), {
    name: 'companiesAdd'
  })
)(CommonAssociateContainer);
