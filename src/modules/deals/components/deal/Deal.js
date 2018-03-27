import React from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { QuickEdit, CommonDeal } from '../';
import { Icon } from 'modules/common/components';
import { DealContainer, DealContainerHover } from '../../styles';

const propTypes = {
  deal: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func.isRequired,
  moveDeal: PropTypes.func.isRequired
};

class Deal extends React.Component {
  constructor(props) {
    super(props);

    this.showQuickEditForm = this.showQuickEditForm.bind(this);
    this.closeQuickEditForm = this.closeQuickEditForm.bind(this);

    this.state = {
      showQuickEdit: false,
      top: 0,
      left: 0,
      bottom: 0
    };
  }

  closeQuickEditForm() {
    this.setState({ showQuickEdit: false });
  }

  showQuickEditForm() {
    const info = this.hover.getBoundingClientRect();

    let top = info.top;

    this.setState({
      showQuickEdit: true,
      top,
      left: info.left
    });
  }

  render() {
    const { deal, saveDeal, removeDeal, moveDeal, index } = this.props;

    if (this.state.showQuickEdit) {
      const { top, bottom, left } = this.state;

      return (
        <QuickEdit
          top={top}
          bottom={bottom}
          left={left}
          close={this.closeQuickEditForm}
          deal={deal}
          saveDeal={saveDeal}
          removeDeal={removeDeal}
          moveDeal={moveDeal}
        />
      );
    }

    return (
      <Draggable draggableId={deal._id} index={index}>
        {(provided, snapshot) => (
          <div>
            <DealContainer
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              isDragging={snapshot.isDragging}
            >
              <CommonDeal deal={deal} />

              <DealContainerHover
                innerRef={el => (this.hover = el)}
                onClick={this.showQuickEditForm}
              >
                <div>
                  <Icon icon="edit" />
                </div>
              </DealContainerHover>
            </DealContainer>
            {provided.placeholder}
          </div>
        )}
      </Draggable>
    );
  }
}

Deal.propTypes = propTypes;

export default Deal;
