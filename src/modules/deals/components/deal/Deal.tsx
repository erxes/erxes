import { ModalTrigger } from 'modules/common/components';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { CommonDeal } from '..';
import { DealEditForm } from '../../containers';
import { Container } from '../../styles/deal';
import { IDeal, IDealParams } from '../../types';

type Props = {
  deal: IDeal;
  index?: number;
  draggable?: boolean;
  saveDeal?: (
    doc: IDealParams,
    callback: () => void,
    deal: IDeal
  ) => Promise<void>;
  removeDeal?: (_id: string, callback: () => void) => Promise<void>;
};

class Deal extends React.Component<Props> {
  showEditForm(trigger: React.ReactNode) {
    const { deal, index, saveDeal, removeDeal } = this.props;

    return (
      <ModalTrigger
        title="Edit deal"
        trigger={trigger}
        size="lg"
        content={props => (
          <DealEditForm
            {...props}
            deal={deal}
            saveDeal={saveDeal}
            removeDeal={removeDeal}
            index={index}
          />
        )}
      />
    );
  }

  renderContent() {
    const { draggable, index, deal } = this.props;

    if (!draggable) {
      return (
        <Container>
          <CommonDeal deal={deal} />
        </Container>
      );
    }

    return (
      <div>
        <Draggable draggableId={deal._id} index={index}>
          {(provided, snapshot) => (
            <React.Fragment>
              <Container
                innerRef={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                isDragging={snapshot.isDragging}
              >
                <CommonDeal deal={deal} />
              </Container>
              {provided.placeholder}
            </React.Fragment>
          )}
        </Draggable>
      </div>
    );
  }

  render() {
    const content = this.renderContent();

    return this.showEditForm(content);
  }
}

export default Deal;
