import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
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
    const {
      data,
      customersQuery,
      customersAdd,
      companiesEditCustomers
    } = this.props;

    const search = (value, loadmore) => {
      if (!loadmore) {
        this.setState({ perPage: 0 });
      }
      this.setState({ perPage: this.state.perPage + 20 }, () => {
        customersQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage
        });
      });
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

    const form = <CustomerForm addCustomer={addCustomer} />;

    const save = customerIds => {
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

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: data.name,
        datas: data.customers
      },
      search,
      title: 'Customer',
      save,
      form,
      renderName: renderFullName,
      perPage: this.state.perPage,
      add: addCustomer,
      datas: customersQuery.customers || []
    };

    return <CommonAssociate {...updatedProps} />;
  }
}

CustomerAssociateContainer.propTypes = {
  data: PropTypes.object.isRequired,
  companiesEditCustomers: PropTypes.func.isRequired,
  customersQuery: PropTypes.object.isRequired,
  customersAdd: PropTypes.func.isRequired
};

const options = ({ data }) => ({
  refetchQueries: [
    {
      query: gql`${companyQueries.companyDetail}`,
      variables: { _id: data._id }
    }
  ]
});

export default compose(
  graphql(gql(queries.customers), {
    name: 'customersQuery',
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
  graphql(gql(companyMutations.companiesEditCustomers), {
    name: 'companiesEditCustomers',
    options
  })
)(CustomerAssociateContainer);
