import { ModalTrigger } from 'modules/common/components';
import React, { Fragment } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { CommonDeal } from '..';
import { DealEditForm } from '../../containers';
import { Container } from '../../styles/deal';

type Props = {
  deal: any,
  saveDeal?: any,
  index?: number,
  removeDeal?: any,
  draggable?: boolean
};

class Deal extends React.Component<Props> {
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
    const { draggable, index, deal } = this.props;

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
        <CommonDeal deal={deal} />
      </Container>
    );
  }

  render() {
    const content = this.renderContent();

    return this.showEditForm(content);
  }
}

export default Deal;
