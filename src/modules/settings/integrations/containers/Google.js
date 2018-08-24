import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

class Google extends Component {
  render() {
    const { accessTokenQuery } = this.props;

    console.log(accessTokenQuery);

    return <div>google</div>;
  }
}

Google.propTypes = {
  accessTokenQuery: PropTypes.object
};

export default compose(
  graphql(
    gql`
      query integrationGetGoogleAccessToken($code: String) {
        integrationGetGoogleAccessToken(code: $code)
      }
    `,
    {
      name: 'accessTokenQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            code: queryParams.code
          }
        };
      }
    }
  )
)(Google);
