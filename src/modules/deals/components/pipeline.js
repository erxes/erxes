import React from 'react';
import Stage from './stage';
import { Droppable } from 'react-beautiful-dnd';

class Pipeline extends React.Component {
  render() {
    const { stages, pipeline, deals } = this.props;
    return (
      <Droppable droppableId={pipeline._id}>
        {provided => (
          <div ref={provided.innerRef} style={{ width: '100%' }}>
            <h2>{pipeline.name}</h2>
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
          </div>
        )}
      </Droppable>
    );
  }
}

export default Pipeline;
