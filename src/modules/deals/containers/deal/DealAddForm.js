import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { DealAddForm } from '../../components';
import { WithSelect } from '../';
import { queries } from '../../graphql';

class DealAddFormContainer extends React.Component {
  render() {
    const WithSelectDealMove = WithSelect(DealAddForm, this.props);

    return <WithSelectDealMove />;
  }
}

const propTypes = {
  saveDeal: PropTypes.func,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  stageId: PropTypes.string
};

DealAddFormContainer.propTypes = propTypes;

const StageList = props => {
  const { stagesQuery } = props;

  if (stagesQuery.loading) {
    return <Spinner />;
  }

  const stages = stagesQuery.dealStages;

  const extendedProps = {
    ...props,
    stageId: stages.length > 0 ? stages[0]._id : ''
  };

  return <DealAddFormContainer {...extendedProps} />;
};

StageList.propTypes = {
  stagesQuery: PropTypes.object
};

const StageListContainer = compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipelineId }) => ({
      variables: {
        pipelineId
      }
    })
  })
)(StageList);

const PipelineList = props => {
  const { pipelinesQuery } = props;

  if (pipelinesQuery.loading) {
    return <Spinner />;
  }

  const pipelines = pipelinesQuery.dealPipelines;

  const extendedProps = {
    ...props,
    pipelineId: pipelines.length > 0 ? pipelines[0]._id : ''
  };

  return <StageListContainer {...extendedProps} />;
};

PipelineList.propTypes = {
  pipelinesQuery: PropTypes.object
};

const PipelineListContainer = compose(
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ boardId }) => ({
      variables: {
        boardId
      }
    })
  })
)(PipelineList);

const BoardList = props => {
  const { boardsQuery } = props;

  if (boardsQuery.loading) {
    return <Spinner />;
  }

  const boards = boardsQuery.dealBoards;

  const extendedProps = {
    ...props,
    boardId: boards.length > 0 ? boards[0]._id : ''
  };

  return <PipelineListContainer {...extendedProps} />;
};

BoardList.propTypes = {
  boardsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  })
)(BoardList);
