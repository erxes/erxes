import dayjs from 'dayjs';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import { Footer, PriceContainer, Right } from 'modules/boards/styles/item';
import { Content, ItemIndicator } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderPriority } from 'modules/boards/utils';
import { __, getUserAvatar } from 'modules/common/utils';
import React from 'react';
import { ITicket } from '../types';

type Props = {
  stageId: string;
  item: ITicket;
  isDragging: boolean;
  provided;
  onClick: () => void;
  beforePopupClose: () => void;
  options?: IOptions;
};
class TicketItem extends React.PureComponent<Props, {}> {
  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  renderForm = () => {
    const { beforePopupClose, stageId, item, options } = this.props;

    return (
      <EditForm
        stageId={stageId}
        itemId={item._id}
        beforePopupClose={beforePopupClose}
        options={options}
      />
    );
  };

  render() {
    const { item, isDragging, provided, onClick } = this.props;
    const { customers, companies } = item;

    return (
      <ItemContainer
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content onClick={onClick}>
          <h5>
            {renderPriority(item.priority)}
            {item.name}
          </h5>

          {customers.map((customer, index) => (
            <div key={index}>
              <ItemIndicator color="#F7CE53" />
              {customer.firstName || customer.primaryEmail || 'Unknown'}
            </div>
          ))}

          {companies.map((company, index) => (
            <div key={index}>
              <ItemIndicator color="#EA475D" />
              {company.primaryName || 'Unknown'}
            </div>
          ))}

          <PriceContainer>
            <Right>
              {(item.assignedUsers || []).map((user, index) => (
                <img
                  alt="Avatar"
                  key={index}
                  src={getUserAvatar(user)}
                  width="22px"
                  height="22px"
                  style={{ marginLeft: '2px', borderRadius: '11px' }}
                />
              ))}
            </Right>
          </PriceContainer>

          <Footer>
            {__('Last updated')}:
            <Right>{this.renderDate(item.modifiedAt)}</Right>
          </Footer>
        </Content>
        {this.renderForm()}
      </ItemContainer>
    );
  }
}

export default TicketItem;
