import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Stage } from '../components';
import { queries } from '../graphql';
import { Spinner } from 'modules/common/components';

class StageContainer extends React.Component {
  render() {
    const { dealsQuery } = this.props;

    if (dealsQuery.loading) {
      return <Spinner />;
    }

    const dealsFromDb = dealsQuery.deals;

    const extendedProps = {
      ...this.props,
      dealsFromDb,
      refetch: dealsQuery.refetch
    };

    return <Stage {...extendedProps} />;
  }
}

const propTypes = {
  dealsQuery: PropTypes.object
};

StageContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ stage }) => ({
      variables: {
        stageId: stage._id
      }
    })
  })
)(StageContainer);
