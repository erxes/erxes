import React from 'react';
import PropTypes from 'prop-types';
import { Stage } from '../containers';
import { EmptyState } from 'modules/common/components';
import { Droppable } from 'react-beautiful-dnd';
import { PipelineContainer, PipelineHeader, PipelineBody } from '../styles';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  stages: PropTypes.array
};

const defaultProps = {
  stages: []
};

class Pipeline extends React.Component {
  renderStages(provided) {
    const { stages, pipeline } = this.props;

    if (stages.length === 0) {
      return <EmptyState size="full" text="No stage" icon="map" />;
    }

    return (
      <div>
        {stages.map((stage, index) => (
          <Stage
            key={stage._id}
            stageId={stage._id}
            index={index}
            length={stages.length}
            pipelineId={pipeline._id}
            state={this.props[`stageState${stage._id}`]}
          />
        ))}
      </div>
    );
  }

  render() {
    const { pipeline } = this.props;

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
              {this.renderStages()}
            </PipelineBody>
          )}
        </Droppable>
      </PipelineContainer>
    );
  }
}

export default Pipeline;

Pipeline.propTypes = propTypes;
Pipeline.defaultProps = defaultProps;
