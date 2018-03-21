import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Draggable } from 'react-beautiful-dnd';
import { DealProduct, DealUser, QuickEdit } from '../';
import { Icon } from 'modules/common/components';
import {
  DealContainer,
  DealContainerHover,
  DealHeader,
  DealAmount
} from '../../styles';

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
    this.setState({
      showQuickEdit: false
    });
  }

  showQuickEditForm() {
    const info = this.hover.getBoundingClientRect();
    const height = window.innerHeight;

    let top = info.top;
    let bottom = 0;

    if (height - top < 670) {
      top = 0;
      bottom = 10;
    }

    this.setState({
      showQuickEdit: true,
      top,
      left: info.left,
      bottom
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
        {provided => (
          <div>
            <DealContainer
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <DealHeader>
                <h4>{deal.customer.firstName || deal.customer.email}</h4>
                <span>{moment(deal.closeDate).format('YYYY-MM-DD')}</span>
              </DealHeader>

              {deal.products ? <DealProduct products={deal.products} /> : null}

              <DealAmount>
                {Object.keys(deal.amount).map(el => (
                  <p key={el}>
                    {deal.amount[el].toLocaleString()} {el}
                  </p>
                ))}
              </DealAmount>

              {deal.assignedUsers ? (
                <DealUser users={deal.assignedUsers} />
              ) : null}

              <DealContainerHover innerRef={el => (this.hover = el)}>
                <div onClick={this.showQuickEditForm}>
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
