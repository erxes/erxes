import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, renderFullName } from 'modules/common/utils';
import {
  queries as companyQueries,
  mutations as companyMutations
} from 'modules/companies/graphql';
import { mutations as customerMutations } from 'modules/customers/graphql';
import { CustomerForm, CommonAssociate } from 'modules/customers/components';

class CustomerAssociateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
  }

  render() {
    const {
      data,
      companyDetailQuery,
      customersAdd,
      companiesEditCustomers
    } = this.props;

    if (companyDetailQuery.loading) {
      return null;
    }

    const company = companyDetailQuery.companyDetail;
    const customers = company.customers || [];
    let datas = data.customers;

    const search = () => {};

    const clearState = () => {};

    const companyId = data.companyId;

    // add customer
    const addCustomer = ({ doc, callback }) => {
      customersAdd({
        variables: doc
      })
        .then(({ data }) => {
          companiesEditCustomers({
            variables: { _id: companyId, customerIds: [data.customersAdd._id] }
          })
            .then(() => {
              companyDetailQuery.refetch();
              Alert.success('Success');
              callback();
            })
            .catch(e => {
              Alert.error(e.message);
            });
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const form = <CustomerForm addCustomer={addCustomer} />;

    const updatedProps = {
      ...this.props,
      data: {
        name: company.name,
        datas
      },
      search,
      title: 'Customer',
      form,
      renderName: renderFullName,
      perPage: this.state.perPage,
      add: addCustomer,
      clearState,
      datas: customers
    };

    return <CommonAssociate {...updatedProps} />;
  }
}

CustomerAssociateContainer.propTypes = {
  data: PropTypes.object.isRequired,
  companyDetailQuery: PropTypes.object.isRequired,
  customersAdd: PropTypes.func.isRequired,
  companiesEditCustomers: PropTypes.func.isRequired
};

export default compose(
  graphql(gql(companyQueries.companyDetail), {
    name: 'companyDetailQuery',
    options: ({ data }) => ({
      variables: {
        _id: data.companyId
      }
    })
  }),
  // mutations
  graphql(gql(customerMutations.customersAdd), {
    name: 'customersAdd'
  }),
  graphql(gql(companyMutations.companiesEditCustomers), {
    name: 'companiesEditCustomers'
  })
)(CustomerAssociateContainer);
