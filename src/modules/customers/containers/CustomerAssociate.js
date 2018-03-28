import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import {
  mutations as companyMutations,
  queries as companyQueries
} from 'modules/companies/graphql';
import { Alert } from 'modules/common/utils';
import { CustomerChooser } from './';

const CustomerAssociate = props => {
  const { companiesEditCustomers, data } = props;

  const save = customers => {
    companiesEditCustomers({
      variables: {
        _id: data._id,
        customerIds: customers.map(customer => customer['_id'])
      }
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
    onSelect: customers => save(customers)
  };

  return <CustomerChooser {...extendedProps} />;
};

CustomerAssociate.propTypes = {
  companiesEditCustomers: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

export default compose(
  graphql(gql(companyMutations.companiesEditCustomers), {
    name: 'companiesEditCustomers',
    options: ({ data }) => ({
      refetchQueries: [
        {
          query: gql`
            ${companyQueries.companyDetail}
          `,
          variables: { _id: data._id }
        }
      ]
    })
  })
)(CustomerAssociate);
