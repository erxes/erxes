import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { Alert } from 'modules/common/utils';
import { CustomerAssociate } from '../components';

class CustomerAssociateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
  }

  render() {
    const { customersQuery, customersAdd } = this.props;

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

    const search = (value, loadmore) => {
      if (loadmore) {
        customersQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage + 20
        });
      } else {
        this.setState({ perPage: 20 });
        customersQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage
        });
      }
    };

    const updatedProps = {
      ...this.props,
      search,
      customers: customersQuery.customers || [],
      addCustomer
    };

    return <CustomerAssociate {...updatedProps} />;
  }
}

CustomerAssociateContainer.propTypes = {
  company: PropTypes.object.isRequired,
  customersQuery: PropTypes.object.isRequired,
  companiesAddCustomer: PropTypes.func,
  save: PropTypes.func.isRequired,
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
  // mutations
  graphql(gql(mutations.customersAdd), {
    name: 'customersAdd'
  })
)(CustomerAssociateContainer);
