import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { Alert } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { CompanyForm } from '../components';

const CompanyFromContainer = props => {
  const {
    companiesEdit,
    company,
    companiesAdd,
    companiesQuery,
    usersQuery
  } = props;

  if (companiesQuery.loading || usersQuery.loading) {
    return <Spinner />;
  }

  let action = ({ doc }) => {
    companiesAdd({ variables: doc })
      .then(() => {
        Alert.success('Success');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (company) {
    action = ({ doc }) => {
      companiesEdit({ variables: { _id: company._id, ...doc } })
        .then(() => {
          Alert.success('Success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };
  }

  const updatedProps = {
    ...props,
    companies: companiesQuery.companies || [],
    users: usersQuery.users || [],
    action
  };

  return <CompanyForm {...updatedProps} />;
};

CompanyFromContainer.propTypes = {
  company: PropTypes.object,
  companiesQuery: PropTypes.object,
  usersQuery: PropTypes.object,
  companiesEdit: PropTypes.func,
  companiesAdd: PropTypes.func
};

CompanyFromContainer.contextTypes = {
  currentUser: PropTypes.object
};

const options = ({ company }) => {
  if (!company) {
    return {
      refetchQueries: ['companiesMain', 'companies']
    };
  }

  return {
    refetchQueries: [
      {
        query: gql`
          ${queries.companyDetail}
        `,
        variables: { _id: company._id }
      }
    ]
  };
};

export default compose(
  graphql(gql(queries.companies), {
    name: 'companiesQuery'
  }),
  graphql(gql(userQueries.users), {
    name: 'usersQuery'
  }),
  graphql(gql(mutations.companiesEdit), {
    name: 'companiesEdit',
    options
  }),
  graphql(gql(mutations.companiesAdd), {
    name: 'companiesAdd',
    options
  })
)(CompanyFromContainer);
