import React from 'react';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Sidebar as SidebarLoader } from 'modules/layout/components';
import { CountsByTag, Spinner } from 'modules/common/components';

const TagContainer = props => {
  const { countsQuery } = props;

  if (countsQuery.loading) {
    return (
      <SidebarLoader.Section>
        <Spinner />
      </SidebarLoader.Section>
    );
  }

  const updatedProps = {
    ...props,
    counts: countsQuery.engageMessageCounts
  };

  return <CountsByTag {...updatedProps} />;
};

TagContainer.propTypes = {
  countsQuery: PropTypes.object
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
