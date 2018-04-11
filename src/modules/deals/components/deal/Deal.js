import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { ModalTrigger } from 'modules/common/components';
import { DealForm } from '../../containers';
import { CommonDeal } from '../';
import { Container } from '../../styles/deal';

const propTypes = {
  deal: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func.isRequired
};

class Deal extends React.Component {
  showEditForm(trigger) {
    const { deal, saveDeal, removeDeal } = this.props;

    return (
      <ModalTrigger title="Edit deal" trigger={trigger} size="lg">
        <DealForm deal={deal} saveDeal={saveDeal} removeDeal={removeDeal} />
      </ModalTrigger>
    );
  }

  render() {
    const { deal, index } = this.props;

    const dragableContent = (
      <div>
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
              </Container>
              {provided.placeholder}
            </Fragment>
          )}
        </Draggable>
      </div>
    );

    return <Fragment>{this.showEditForm(dragableContent)}</Fragment>;
  }
}

Deal.propTypes = propTypes;

export default Deal;
