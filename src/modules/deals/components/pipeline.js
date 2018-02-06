import React from 'react';
import { Wrapper } from 'modules/layout/components';
import PropTypes from 'prop-types';
import Stage from './stage';
import { Droppable } from 'react-beautiful-dnd';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  stages: PropTypes.array.isRequired,
  deals: PropTypes.array.isRequired
};

class Pipeline extends React.Component {
  render() {
    const { stages, pipeline, deals } = this.props;

    const content = innerRef => (
      <div ref={innerRef}>
        <h2>{pipeline.name}</h2>
        <ul>
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
        </ul>
      </div>
    );

    return (
      <Droppable type="STAGE" droppableId={pipeline._id}>
        {provided => <Wrapper content={content(provided.innerRef)} />}
      </Droppable>
    );
  }
}

export default Pipeline;

Pipeline.propTypes = propTypes;
