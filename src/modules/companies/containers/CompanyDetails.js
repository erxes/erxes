import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { Loading } from 'modules/common/components';
import { queries, mutations } from '../graphql';
import { CompanyDetails } from '../components';

const CompanyDetailsContainer = (props, context) => {
  const {
    id,
    companyDetailQuery,
    companyActivityLogQuery,
    companiesEdit,
    fieldsQuery,
    companiesAddCustomer
  } = props;

  if (
    companyDetailQuery.loading ||
    fieldsQuery.loading ||
    companyActivityLogQuery.loading
  ) {
    return (
      <Loading title="Companies" sidebarSize="wide" spin hasRightSidebar />
    );
  }

  const save = (variables, callback) => {
    companiesEdit({ variables: { _id: id, ...variables } })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const addCustomer = ({ doc, callback }) => {
    companiesAddCustomer({ variables: { _id: id, ...doc } })
      .then(() => {
        companyDetailQuery.refetch();
        Alert.success('Success');
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    company: {
      ...companyDetailQuery.companyDetail,
      refetch: companyDetailQuery.refetch
    },
    companyActivityLog: companyActivityLogQuery.activityLogsCompany,
    save,
    addCustomer,
    currentUser: context.currentUser,
    customFields: fieldsQuery.fields
  };

  return <CompanyDetails {...updatedProps} />;
};

CompanyDetailsContainer.propTypes = {
  id: PropTypes.string,
  companyDetailQuery: PropTypes.object,
  fieldsQuery: PropTypes.object,
  companiesEdit: PropTypes.func,
  companiesAddCustomer: PropTypes.func,
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
  graphql(gql(mutations.companiesEdit), {
    name: 'companiesEdit'
  }),
  graphql(gql(queries.fields), {
    name: 'fieldsQuery'
  }),
  graphql(gql(mutations.companiesAddCustomer), {
    name: 'companiesAddCustomer'
  })
)(CompanyDetailsContainer);
