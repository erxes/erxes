import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Sidebar } from '../../components';
import { Sidebar as SidebarLoader } from 'modules/layout/components';
import { Spinner } from 'modules/common/components';

const MainContainer = props => {
  const { countsQuery } = props;

  if (countsQuery.loading) {
    return (
      <SidebarLoader.Section>
        <Spinner objective />
      </SidebarLoader.Section>
    );
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
