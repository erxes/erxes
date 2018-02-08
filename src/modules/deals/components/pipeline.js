import React from 'react';
import PropTypes from 'prop-types';
import Stage from './stage';
import { Droppable } from 'react-beautiful-dnd';
import { PipelineContainer, PipelineHeader, PipelineBody } from '../styles';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  stages: PropTypes.array.isRequired,
  deals: PropTypes.object.isRequired
};

class Pipeline extends React.Component {
  render() {
    const { stages, pipeline, deals } = this.props;

    const content = innerRef => (
      <PipelineBody innerRef={innerRef}>
        {stages.map((stage, index) => {
          return (
            <Stage
              key={stage._id}
              index={index}
              stage={stage}
              deals={deals[stage._id]}
            />
          );
        })}
      </PipelineBody>
    );

    return (
      <PipelineContainer>
        <PipelineHeader>
          <h2>{pipeline.name}</h2>
        </PipelineHeader>
        <Droppable type="STAGE" droppableId={pipeline._id}>
          {provided => content(provided.innerRef)}
        </Droppable>
      </PipelineContainer>
    );
  }
}

export default Pipeline;

Pipeline.propTypes = propTypes;
