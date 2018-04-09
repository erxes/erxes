import React from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { CommonDeal } from '../../containers';
import { Container } from '../../styles/deal';

const propTypes = {
  dealId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func.isRequired,
  moveDeal: PropTypes.func.isRequired
};

class Deal extends React.Component {
  render() {
    const { dealId, saveDeal, removeDeal, moveDeal, index } = this.props;

    return (
      <Draggable draggableId={dealId} index={index}>
        {(provided, snapshot) => (
          <div>
            <Container
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              isDragging={snapshot.isDragging}
            >
              <CommonDeal
                dealId={dealId}
                saveDeal={saveDeal}
                removeDeal={removeDeal}
                moveDeal={moveDeal}
              />
            </Container>
            {provided.placeholder}
          </div>
        )}
      </Draggable>
    );
  }
}

Deal.propTypes = propTypes;

export default Deal;
