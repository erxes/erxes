import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Deal from './deal';

class Stage extends React.Component {
  render() {
    const { stage, deals, index } = this.props;

    return (
      <Draggable draggableId={stage._id} index={index}>
        <div style={{ width: 300, float: 'left' }}>
          <h3>{stage.name}</h3>
          <Droppable droppableId={stage._id}>
            {provided => (
              <div>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  {deals.map((deal, i) => (
                    <Deal key={deal._id} deal={deal} index={i} />
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </Draggable>
    );
  }
}

export default Stage;
