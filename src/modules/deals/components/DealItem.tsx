import dayjs from 'dayjs';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import { Footer, PriceContainer, Right } from 'modules/boards/styles/item';
import { Content, ItemIndicator } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderAmount } from 'modules/boards/utils';
import Icon from 'modules/common/components/Icon';
import { IRouterProps } from 'modules/common/types';
import { __, getUserAvatar } from 'modules/common/utils';
import routerUtils from 'modules/common/utils/router';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { withRouter } from 'react-router';
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
  queryParams: any;
} & IRouterProps;

class DealItem extends React.PureComponent<Props, { isFormVisible: boolean }> {
  constructor(props) {
    super(props);

    let isFormVisible = false;

    const { queryParams, item } = props;

    if (queryParams.itemId && queryParams.itemId === item._id) {
      isFormVisible = true;
    }

    this.state = { isFormVisible };
  }

  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  toggleForm = (itemId?: string) => {
    const { queryParams } = this.props;
    this.props.onTogglePopup();

    const { isFormVisible } = this.state;

    this.setState({ isFormVisible: !isFormVisible }, () => {
      if (queryParams.itemId) {
        return routerUtils.removeParams(this.props.history, 'itemId');
      }

      return routerUtils.setParams(this.props.history, { itemId });
    });
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
        <Content onClick={this.toggleForm.bind(this, item._id)}>
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

export default withRouter<Props>(DealItem);
