import React, { PropTypes } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { compose, gql, graphql } from 'react-apollo';
import { Sidebar } from '../../components';
import { LoadingSidebar } from '/imports/react-ui/common';

const StatusContainer = props => {
  const { countsQuery } = props;

  if (countsQuery.loading) {
    return <LoadingSidebar.Section />;
  }

  const updatedProps = {
    ...props,
    counts: countsQuery.engageMessageCounts,
  };

  return <Sidebar.Status {...updatedProps} />;
};

StatusContainer.propTypes = {
  countsQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query statusCounts($kind: String) {
        engageMessageCounts(name: "status", kind: $kind)
      }
    `,
    {
      name: 'countsQuery',
      options: () => {
        const queryParams = FlowRouter.current().queryParams;

        return {
          variables: {
            kind: queryParams.kind || '',
          },
        };
      },
    },
  ),
)(StatusContainer);
