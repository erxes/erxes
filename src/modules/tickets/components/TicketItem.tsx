import dayjs from 'dayjs';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import { Footer, PriceContainer, Right } from 'modules/boards/styles/item';
import { Content, ItemIndicator } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderPriority } from 'modules/boards/utils';
import { __, getUserAvatar } from 'modules/common/utils';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { ITicket } from '../types';

type Props = {
  stageId: string;
  item: ITicket;
  isFormVisible: boolean;
  isDragging: boolean;
  provided;
  onAdd: (stageId: string, item: ITicket) => void;
  onRemove: (dealId: string, stageId: string) => void;
  onUpdate: (item: ITicket) => void;
  onTogglePopup: () => void;
  options: IOptions;
};
class TicketItem extends React.PureComponent<Props, {}> {
  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  renderForm = () => {
    const {
      onTogglePopup,
      isFormVisible,
      stageId,
      item,
      onAdd,
      onRemove,
      onUpdate,
      options
    } = this.props;

    if (!isFormVisible) {
      return null;
    }

    return (
      <Modal bsSize="lg" show={true} onHide={onTogglePopup}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{__('Edit ticket')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditForm
            options={options}
            stageId={stageId}
            itemId={item._id}
            onAdd={onAdd}
            onRemove={onRemove}
            onUpdate={onUpdate}
            closeModal={onTogglePopup}
          />
        </Modal.Body>
      </Modal>
    );
  };

  render() {
    const { item, isDragging, provided, onTogglePopup } = this.props;
    const { customers, companies } = item;

    return (
      <ItemContainer
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content onClick={onTogglePopup}>
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
