import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withSelect } from '../';
import { DealMove } from '../../components';
import { queries } from '../../graphql';

const propTypes = {
  deal: PropTypes.object,
  stageId: PropTypes.string
};

class DealMoveContainer extends React.Component {
  render() {
    const { deal, stageId } = this.props;

    const updatedProps = {
      ...this.props,
      boardId: deal.boardId,
      stageId,
      pipelineId: deal.pipelineId
    };

    const WithSelectDealSelect = withSelect(DealMove, updatedProps);

    return <WithSelectDealSelect />;
  }
}

DealMoveContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ deal: { boardId } }) => ({
      variables: {
        boardId
      }
    })
  }),
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ deal: { pipelineId } }) => ({
      variables: {
        pipelineId
      }
    })
  })
)(DealMoveContainer);
