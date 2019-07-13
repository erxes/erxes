import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import { Footer, PriceContainer, Right } from 'modules/boards/styles/item';
import { Content, ItemIndicator } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderAmount } from 'modules/boards/utils';
import Icon from 'modules/common/components/Icon';
import { __, getUserAvatar } from 'modules/common/utils';
import moment from 'moment';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { IDeal } from '../types';

type Props = {
  stageId: string;
  item: IDeal;
  isDragging: boolean;
  provided;
  onAdd: (stageId: string, item: IDeal) => void;
  onRemove: (dealId: string, stageId: string) => void;
  onUpdate: (item: IDeal) => void;
  onTogglePopup: () => void;
  options: IOptions;
};

export default class DealItem extends React.PureComponent<
  Props,
  { isFormVisible: boolean }
> {
  constructor(props) {
    super(props);

    this.state = { isFormVisible: false };
  }

  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{moment(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  toggleForm = () => {
    this.props.onTogglePopup();

    const { isFormVisible } = this.state;

    this.setState({ isFormVisible: !isFormVisible });
  };

  renderForm = () => {
    const { stageId, item, onAdd, onRemove, onUpdate, options } = this.props;
    const { isFormVisible } = this.state;

    if (!isFormVisible) {
      return null;
    }

    return (
      <Modal
        enforceFocus={false}
        bsSize="lg"
        show={true}
        onHide={this.toggleForm}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>{__('Edit deal')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditForm
            options={options}
            stageId={stageId}
            itemId={item._id}
            onAdd={onAdd}
            onRemove={onRemove}
            onUpdate={onUpdate}
            closeModal={this.toggleForm}
          />
        </Modal.Body>
      </Modal>
    );
  };

  render() {
    const { item, isDragging, provided } = this.props;
    const products = (item.products || []).map(p => p.product);
    const { customers, companies } = item;

    return (
      <ItemContainer
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content onClick={this.toggleForm}>
          <h5>{item.name}</h5>

          {products.map((product, index) => (
            <div key={index}>
              <ItemIndicator color="#63D2D6" />
              {product.name}
            </div>
          ))}

          {customers.map((customer, index) => (
            <div key={index}>
              <ItemIndicator color="#F7CE53" />
              {customer.firstName || customer.primaryEmail}
            </div>
          ))}

          {companies.map((company, index) => (
            <div key={index}>
              <ItemIndicator color="#EA475D" />
              {company.primaryName}
            </div>
          ))}

          <PriceContainer>
            {renderAmount(item.amount)}

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
            {item.isWatched ? <Icon icon="eye" /> : __('Last updated')}
            <Right>{this.renderDate(item.modifiedAt)}</Right>
          </Footer>
        </Content>
        {this.renderForm()}
      </ItemContainer>
    );
  }
}
