import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { queries } from '../../graphql';
import { CompanyDetails } from '../../components';

const CompanyDetailsContainer = (props, { currentUser }) => {
  const { companyDetailQuery, companyActivityLogQuery } = props;

  if (companyDetailQuery.loading) {
    return <Spinner />;
  }

  const companyDetail = companyDetailQuery.companyDetail;

  const updatedProps = {
    ...props,
    loadingLogs: companyActivityLogQuery.loading,
    company: companyDetail,
    companyActivityLog: companyActivityLogQuery.activityLogsCompany || [],
    currentUser
  };

  return <CompanyDetails {...updatedProps} />;
};

CompanyDetailsContainer.propTypes = {
  companyDetailQuery: PropTypes.object,
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
  })
)(CompanyDetailsContainer);
