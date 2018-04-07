import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { ModalTrigger } from 'modules/common/components';
import { DealForm } from '../../containers';
import { CommonDeal } from '../';
import { Container, ContainerHover } from '../../styles/deal';

const propTypes = {
  deal: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func.isRequired,
  moveDeal: PropTypes.func.isRequired
};

class Deal extends React.Component {
  showEditForm() {
    const { deal, saveDeal, removeDeal, moveDeal } = this.props;

    return (
      <ModalTrigger title="Edit deal" trigger={<ContainerHover />} size="lg">
        <DealForm
          deal={deal}
          saveDeal={saveDeal}
          moveDeal={moveDeal}
          removeDeal={removeDeal}
        />
      </ModalTrigger>
    );
  }

  render() {
    const { deal, index } = this.props;

    return (
      <Draggable draggableId={deal._id} index={index}>
        {(provided, snapshot) => (
          <Fragment>
            <Container
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              isDragging={snapshot.isDragging}
            >
              <CommonDeal deal={deal} />

              {this.showEditForm()}
            </Container>
            {provided.placeholder}
          </Fragment>
        )}
      </Draggable>
    );
  }
}

Deal.propTypes = propTypes;

export default Deal;
