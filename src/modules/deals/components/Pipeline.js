import React from 'react';
import PropTypes from 'prop-types';
import { Stage } from '../containers';
import { Droppable } from 'react-beautiful-dnd';
import {
  PipelineContainer,
  PipelineHeader,
  PipelineBody,
  EmptyStage
} from '../styles';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  boardId: PropTypes.string,
  stages: PropTypes.array,
  collectDeals: PropTypes.func,
  dealsByStage: PropTypes.object,
  dealResult: PropTypes.object,
  addToDeals: PropTypes.func
};

class Pipeline extends React.Component {
  render() {
    const { stages, pipeline, boardId, dealsByStage, dealResult } = this.props;

    return (
      <PipelineContainer>
        <PipelineHeader>
          <h2>{pipeline.name}</h2>
        </PipelineHeader>
        <Droppable
          type="STAGE"
          direction="horizontal"
          droppableId={pipeline._id}
        >
          {provided => (
            <PipelineBody
              innerRef={provided.innerRef}
              {...provided.droppableProps}
            >
              <div>
                {stages.map((stage, index) => {
                  return (
                    <Stage
                      key={stage._id}
                      stage={stage}
                      index={index}
                      boardId={boardId}
                      pipelineId={pipeline._id}
                      deals={dealsByStage[stage._id] || []}
                      collectDeals={this.props.collectDeals}
                      addToDeals={this.props.addToDeals}
                      dealResult={dealResult}
                    />
                  );
                })}
                <EmptyStage />
              </div>
            </PipelineBody>
          )}
        </Droppable>
      </PipelineContainer>
    );
  }
}

export default Pipeline;

Pipeline.propTypes = propTypes;
