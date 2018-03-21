import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import {
  mutations as companyMutations,
  queries as companyQueries
} from 'modules/companies/graphql';
import { Alert, renderFullName } from 'modules/common/utils';
import { CommonAssociate } from '../components';
import { CustomerForm } from '../components';

class CustomerAssociateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
  }

  render() {
    const { data, customersQuery, customersAdd } = this.props;

    const search = (value, loadmore) => {
      if (!loadmore) {
        this.setState({ perPage: 0 });
      }

      this.setState({ perPage: this.state.perPage + 20 }, () =>
        customersQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage
        })
      );
    };

    const clearState = () => {
      customersQuery.refetch({ searchValue: '' });
    };

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
      ...this.props,
      data: {
        _id: data._id,
        name: data.name,
        datas: data.customers
      },
      search,
      title: 'Customer',
      form,
      renderName: renderFullName,
      perPage: this.state.perPage,
      add: addCustomer,
      clearState,
      datas: customersQuery.customers || []
    };

    return <CommonAssociate {...updatedProps} />;
  }
}

CustomerAssociateContainer.propTypes = {
  data: PropTypes.object.isRequired,
  customersQuery: PropTypes.object.isRequired,
  customersAdd: PropTypes.func.isRequired
};

const CustomerEditCompaniesContainer = props => {
  const { companiesEditCustomers, data } = props;

  const save = customers => {
    const customerIds = [];

    customers.forEach(data => {
      customerIds.push(data._id.toString());
    });

    companiesEditCustomers({
      variables: { _id: data._id, customerIds }
    })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const extendedProps = {
    ...props,
    save
  };

  return <CustomerAssociateContainer {...extendedProps} />;
};

CustomerEditCompaniesContainer.propTypes = {
  companiesEditCustomers: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

const CustomerEditCompanies = compose(
  graphql(gql(companyMutations.companiesEditCustomers), {
    name: 'companiesEditCustomers',
    options: ({ data }) => ({
      refetchQueries: [
        {
          query: gql`
            ${companyQueries.customerDetail}
          `,
          variables: { _id: data._id }
        }
      ]
    })
  })
)(CustomerEditCompaniesContainer);

const MainContainer = props => {
  const { data } = props;

  if (data._id) {
    return <CustomerEditCompanies {...props} />;
  }

  return <CustomerAssociateContainer {...props} />;
};

MainContainer.propTypes = {
  data: PropTypes.object
};

export default compose(
  graphql(gql(queries.customers), {
    name: 'customersQuery',
    options: ({ companyId }) => {
      return {
        variables: {
          perPage: 20,
          companyIds: [companyId] || []
        }
      };
    }
  }),
  // mutations
  graphql(gql(mutations.customersAdd), {
    name: 'customersAdd'
  })
)(MainContainer);
