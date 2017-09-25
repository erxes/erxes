import React from 'react';
import PropTypes from 'prop-types';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { compose, gql, graphql } from 'react-apollo';
import { CountsByTag, LoadingSidebar } from '/imports/react-ui/common';

const TagContainer = props => {
  const { countsQuery } = props;

  if (countsQuery.loading) {
    return <LoadingSidebar.Section />;
  }

  const updatedProps = {
    ...props,
    counts: countsQuery.engageMessageCounts,
  };

  return <CountsByTag {...updatedProps} />;
};

TagContainer.propTypes = {
  countsQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query tagCounts($kind: String, $status: String) {
        engageMessageCounts(name: "tag", kind: $kind, status: $status)
      }
    `,
    {
      name: 'countsQuery',
      options: () => {
        const queryParams = FlowRouter.current().queryParams;

        return {
          variables: {
            kind: queryParams.kind || '',
            status: queryParams.status || '',
          },
        };
      },
    },
  ),
)(TagContainer);
