import React from 'react';
import Stage from './stage';
import { Droppable } from 'react-beautiful-dnd';

class Pipeline extends React.Component {
  render() {
    const { stages, pipeline, deals } = this.props;

    return (
      <Droppable type="STAGE" droppableId={pipeline._id} direction="horizontal">
        {provided => (
          <div ref={provided.innerRef} style={{ width: '100%' }}>
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
        )}
      </Droppable>
    );
  }
}

export default Pipeline;
