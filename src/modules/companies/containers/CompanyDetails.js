import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { CompanyDetails } from '../components';

const CompanyDetailsContainer = (props, context) => {
  const {
    id,
    companyDetailQuery,
    companyActivityLogQuery,
    companiesEdit,
    companiesEditCustomers,
    fieldsQuery
  } = props;

  const save = (variables, callback) => {
    companiesEdit({ variables: { _id: id, ...variables } })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const editCustomers = variables => {
    companiesEditCustomers({
      variables: { _id: id, ...variables }
    })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    company: companyDetailQuery.companyDetail || {
      customers: [],
      customFieldsData: {}
    },
    companyActivityLog: companyActivityLogQuery.activityLogsCompany || [],
    save,
    editCustomers,
    currentUser: context.currentUser,
    customFields: fieldsQuery.fields || []
  };

  return <CompanyDetails {...updatedProps} />;
};

CompanyDetailsContainer.propTypes = {
  id: PropTypes.string,
  companyDetailQuery: PropTypes.object,
  fieldsQuery: PropTypes.object,
  companiesEdit: PropTypes.func,
  companiesEditCustomers: PropTypes.func,
  companyActivityLogQuery: PropTypes.object
};

CompanyDetailsContainer.contextTypes = {
  currentUser: PropTypes.object
};

export default compose(
  graphql(gql(queries.companyDetail), {
    name: 'companyDetailQuery',
    options: ({ id }) => ({
      variables: {
        _id: id
      }
    })
  }),
  graphql(gql(queries.activityLogsCompany), {
    name: 'companyActivityLogQuery',
    options: ({ id }) => ({
      variables: {
        _id: id
      }
    })
  }),
  graphql(gql(queries.fields), {
    name: 'fieldsQuery'
  }),
  graphql(gql(mutations.companiesEdit), {
    name: 'companiesEdit'
  }),
  graphql(gql(mutations.companiesEditCustomers), {
    name: 'companiesEditCustomers'
  })
)(CompanyDetailsContainer);
