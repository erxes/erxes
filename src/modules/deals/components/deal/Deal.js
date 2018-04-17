import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { ModalTrigger } from 'modules/common/components';
import { DealEditForm } from '../../containers';
import { CommonDeal } from '../';
import { Container } from '../../styles/deal';

const propTypes = {
  deal: PropTypes.object.isRequired,
  saveDeal: PropTypes.func.isRequired,
  index: PropTypes.number,
  removeDeal: PropTypes.func,
  draggable: PropTypes.bool
};

class Deal extends React.Component {
  showEditForm(trigger) {
    const { deal, index, saveDeal, removeDeal } = this.props;

    return (
      <ModalTrigger title="Edit deal" trigger={trigger} size="lg">
        <DealEditForm
          deal={deal}
          saveDeal={saveDeal}
          removeDeal={removeDeal}
          index={index}
        />
      </ModalTrigger>
    );
  }

  renderContent() {
    const { draggable, index, deal, saveDeal, removeDeal } = this.props;

    if (draggable) {
      return (
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
    }

    return (
      <Container>
        <CommonDeal deal={deal} saveDeal={saveDeal} removeDeal={removeDeal} />
      </Container>
    );
  }

  render() {
    const content = this.renderContent();

    return <Fragment>{this.showEditForm(content)}</Fragment>;
  }
}

Deal.propTypes = propTypes;

export default Deal;
