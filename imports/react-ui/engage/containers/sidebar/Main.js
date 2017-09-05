import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { Sidebar } from '../../components';

const MainContainer = props => {
  const { countsQuery } = props;

  if (countsQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    counts: countsQuery.engageMessageCounts,
  };

  return <Sidebar.Main {...updatedProps} />;
};

MainContainer.propTypes = {
  countsQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
    query kindCounts {
      engageMessageCounts(name: "kind")
    }
  `,
    { name: 'countsQuery' },
  ),
)(MainContainer);
