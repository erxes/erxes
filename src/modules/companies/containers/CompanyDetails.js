import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { CompanyDetails } from '../components';

const CompanyDetailsContainer = (props, context) => {
  const {
    id,
    companyDetailQuery,
    companyActivityLogQuery,
    companiesEdit,
    fieldsQuery
  } = props;

  //refetch for display customer change
  companyDetailQuery.refetch();

  const save = (variables, callback) => {
    companiesEdit({ variables: { _id: id, ...variables } })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    ...props,
    save,
    loadingLogs: companyActivityLogQuery.loading,
    company: companyDetailQuery.companyDetail || {
      customers: [],
      customFieldsData: {}
    },
    companyActivityLog: companyActivityLogQuery.activityLogsCompany || [],
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
  })
)(CompanyDetailsContainer);
