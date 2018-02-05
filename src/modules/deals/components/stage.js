import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Deal from './deal';
import { Item } from '../styles';

class Stage extends React.Component {
  render() {
    const { stage, deals, index } = this.props;

    return (
      <Draggable draggableId={stage._id} index={index}>
        {provided => {
          return (
            <Item
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <h3>{stage.name}</h3>
              <Droppable droppableId={stage._id} type="DEAL">
                {dropProvided => (
                  <div ref={dropProvided.innerRef}>
                    <div>
                      {deals.map((deal, i) => (
                        <Deal key={deal._id} deal={deal} index={i} />
                      ))}
                    </div>
                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </Item>
          );
        }}
      </Draggable>
    );
  }
}

export default Stage;
