import React from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import moment from 'moment';
import { DealProduct, DealUser } from '../';

import { DealContainer, DealHeader, DealAmount } from '../../styles';

const propTypes = {
  deal: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
};

class Deal extends React.Component {
  render() {
    const { deal, index } = this.props;

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
