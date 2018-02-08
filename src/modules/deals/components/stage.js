import React from 'react';
import PropTypes from 'prop-types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Deal from './deal';
import { StageContainer } from '../styles';

const propTypes = {
  stage: PropTypes.object.isRequired,
  deals: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired
};

class Stage extends React.Component {
  render() {
    const { stage, deals, index } = this.props;

    return (
      <Draggable draggableId={stage._id} index={index}>
        {provided => {
          return (
            <StageContainer
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
            </StageContainer>
          );
        }}
      </Draggable>
    );
  }
}

export default Stage;

Stage.propTypes = propTypes;
