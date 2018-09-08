import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { queries } from 'modules/settings/integrations/graphql';

const ConnectCalendar = props => {
  const { Form, type, googleAuthUrlQuery, googleAccessTokenQuery } = props;

  if (type === 'link') {
    if (googleAuthUrlQuery.loading) {
      return <Spinner />;
    }

    window.location.href = googleAuthUrlQuery.integrationGetGoogleAuthUrl;

    return <Spinner />;
  }

  if (type === 'form' && googleAccessTokenQuery.loading) {
    return <Spinner />;
  }

  return (
    <Form
      {...props}
      credentials={googleAccessTokenQuery.integrationGetGoogleAccessToken}
    />
  );
};

ConnectCalendar.propTypes = {
  Form: PropTypes.func,
  type: PropTypes.string,
  history: PropTypes.object,
  queryParams: PropTypes.object,
  googleAuthUrlQuery: PropTypes.object,
  googleAccessTokenQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.getGoogleAuthUrl), {
    name: 'googleAuthUrlQuery',
    skip: ({ type }) => type === 'form'
  }),
  graphql(gql(queries.getGoogleAccessToken), {
    name: 'googleAccessTokenQuery',
    skip: ({ queryParams }) => !queryParams.code,
    options: ({ queryParams }) => ({
      variables: { code: queryParams.code }
    })
  })
)(ConnectCalendar);
