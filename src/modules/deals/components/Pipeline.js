import React from 'react';
import PropTypes from 'prop-types';
import { Stage } from '../containers';
import { Droppable } from 'react-beautiful-dnd';
import { PipelineContainer, PipelineHeader, PipelineBody } from '../styles';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  boardId: PropTypes.string,
  stages: PropTypes.array,
  collectDeals: PropTypes.func,
  dealResult: PropTypes.object,
  addToDeals: PropTypes.func
};

class Pipeline extends React.Component {
  render() {
    const { stages, pipeline, boardId } = this.props;

    return (
      <PipelineContainer>
        <PipelineHeader>
          <h2>{pipeline.name}</h2>
        </PipelineHeader>

        <Droppable
          type="pipeline"
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
                      stageId={stage._id}
                      index={index}
                      boardId={boardId}
                      pipelineId={pipeline._id}
                      state={this.props[`stageState${stage._id}`]}
                    />
                  );
                })}
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
