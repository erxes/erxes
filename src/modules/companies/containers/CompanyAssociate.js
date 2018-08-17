import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations as customerMutations } from 'modules/customers/graphql';
import { Alert } from 'modules/common/utils';
import { CompanySection } from '../components';

const CompanyAssociate = props => {
  const { customersEditCompanies, data } = props;

  const save = companies => {
    customersEditCompanies({
      variables: {
        _id: data._id,
        companyIds: companies.map(company => company['_id'])
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
    name: data.name,
    companies: data.companies,
    onSelect: companies => save(companies)
  };

  return <CompanySection {...extendedProps} />;
};

CompanyAssociate.propTypes = {
  customersEditCompanies: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

export default compose(
  graphql(gql(customerMutations.customersEditCompanies), {
    name: 'customersEditCompanies',
    options: ({ data }) => ({
      refetchQueries: ['customerDetail']
    })
  })
)(CompanyAssociate);
