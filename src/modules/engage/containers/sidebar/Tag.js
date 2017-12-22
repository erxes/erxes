import React from 'react';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { CountsByTag } from 'modules/common/components';

const TagContainer = props => {
  const { countsQuery } = props;

  const updatedProps = {
    ...props,
    counts: countsQuery.engageMessageCounts || {},
    loading: countsQuery.loading
  };

  return <CountsByTag {...updatedProps} />;
};

TagContainer.propTypes = {
  countsQuery: PropTypes.object,
  loading: PropTypes.bool
};

export default withRouter(
  compose(
    graphql(
      gql`
        query tagCounts($kind: String, $status: String) {
          engageMessageCounts(name: "tag", kind: $kind, status: $status)
        }
      `,
      {
        name: 'countsQuery',
        options: ({ location }) => {
          const queryParams = queryString.parse(location.search);

          return {
            variables: {
              kind: queryParams.kind || '',
              status: queryParams.status || ''
            }
          };
        }
      }
    )
  )(TagContainer)
);
