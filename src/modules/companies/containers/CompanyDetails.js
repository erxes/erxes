import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries } from '../graphql';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { Spinner } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { CompanyDetails } from '../components';

const CompanyDetailsContainer = (props, context) => {
  const {
    companyDetailQuery,
    companyActivityLogQuery,
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

  const updatedProps = {
    ...props,
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
  graphql(gql(fieldQueries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: () => ({
      variables: {
        contentType: FIELDS_GROUPS_CONTENT_TYPES.COMPANY
      }
    })
  })
)(CompanyDetailsContainer);
