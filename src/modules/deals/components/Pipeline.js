import React from 'react';
import PropTypes from 'prop-types';
import { Stage } from '../containers';
import { EmptyState } from 'modules/common/components';
import { Droppable } from 'react-beautiful-dnd';
import { Container, Header, Body } from '../styles/pipeline';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  stages: PropTypes.array,
  collectDeals: PropTypes.func,
  dealResult: PropTypes.object,
  addToDeals: PropTypes.func
};

class Pipeline extends React.Component {
  renderStage(provided) {
    const { stages, pipeline } = this.props;
    const length = stages.length;

    return (
      <Body innerRef={provided.innerRef} {...provided.droppableProps}>
        <div>
          {stages.map((stage, index) => (
            <Stage
              key={stage._id}
              stageId={stage._id}
              index={index}
              length={length}
              pipelineId={pipeline._id}
              state={this.props[`stageState${stage._id}`]}
            />
          ))}
        </div>
        {stages.length === 0 && (
          <EmptyState size="full" text="No stage" icon="map" />
        )}
      </Body>
    );
  }

  render() {
    const { pipeline } = this.props;

    return (
      <Container>
        <Header>
          <h2>{pipeline.name}</h2>
        </Header>

        <Droppable
          type="pipeline"
          direction="horizontal"
          droppableId={pipeline._id}
        >
          {provided => this.renderStage(provided)}
        </Droppable>
      </Container>
    );
  }
}

export default Pipeline;

Pipeline.propTypes = propTypes;
