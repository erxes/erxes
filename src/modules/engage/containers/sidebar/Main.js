import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Sidebar } from '../../components';
import { LoadingSidebar } from 'modules/common/components';

const MainContainer = props => {
  const { countsQuery } = props;

  if (countsQuery.loading) {
    return <LoadingSidebar.Section />;
  }

  const updatedProps = {
    ...props,
    counts: countsQuery.engageMessageCounts
  };

  return <Sidebar.Main {...updatedProps} />;
};

MainContainer.propTypes = {
  countsQuery: PropTypes.object
};

export default compose(
  graphql(
    gql`
      query kindCounts {
        engageMessageCounts(name: "kind")
      }
    `,
    { name: 'countsQuery' }
  )
)(MainContainer);
