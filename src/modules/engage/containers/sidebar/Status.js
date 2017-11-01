import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { compose, gql, graphql } from 'react-apollo';
import { Sidebar } from '../../components';
import { LoadingSidebar } from 'modules/common/components';

const StatusContainer = props => {
  const { countsQuery } = props;

  if (countsQuery.loading) {
    return <LoadingSidebar.Section />;
  }

  const updatedProps = {
    ...props,
    counts: countsQuery.engageMessageCounts
  };

  return <Sidebar.Status {...updatedProps} />;
};

StatusContainer.propTypes = {
  countsQuery: PropTypes.object
};

export default withRouter(
  compose(
    graphql(
      gql`
        query statusCounts($kind: String) {
          engageMessageCounts(name: "status", kind: $kind)
        }
      `,
      {
        name: 'countsQuery',
        options: ({ location }) => {
          const queryParams = queryString.parse(location.search);

          return {
            variables: {
              kind: queryParams.kind || ''
            }
          };
        }
      }
    )
  )(StatusContainer)
);
