import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries, mutations } from '../graphql';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { Spinner } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { CompanyDetails } from '../components';

const CompanyDetailsContainer = (props, context) => {
  const {
    id,
    companyDetailQuery,
    companyActivityLogQuery,
    companiesEdit,
    fieldsGroupsQuery
  } = props;

  if (companyDetailQuery.loading) {
    return (
      <Sidebar full>
        <Spinner />
      </Sidebar>
    );
  }

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
    company: companyDetailQuery.companyDetail,
    customFieldsData: companyDetailQuery.companyDetail.customFieldsData || {},
    companyActivityLog: companyActivityLogQuery.activityLogsCompany || [],
    currentUser: context.currentUser,
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <CompanyDetails {...updatedProps} />;
};

CompanyDetailsContainer.propTypes = {
  id: PropTypes.string,
  companyDetailQuery: PropTypes.object,
  fieldsGroupsQuery: PropTypes.object,
  companiesEdit: PropTypes.func,
  companyActivityLogQuery: PropTypes.object
};

CompanyDetailsContainer.contextTypes = {
  currentUser: PropTypes.object
};

const options = ({ id }) => ({
  refetchQueries: [
    { query: gql`${queries.companyDetail}`, variables: { _id: id } }
  ]
});

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
  graphql(gql(fieldQueries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: () => ({
      variables: {
        contentType: FIELDS_GROUPS_CONTENT_TYPES.COMPANY
      }
    })
  }),
  graphql(gql(mutations.companiesEdit), {
    name: 'companiesEdit',
    options
  })
)(CompanyDetailsContainer);
