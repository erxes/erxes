import dayjs from 'dayjs';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import { Footer, PriceContainer, Right } from 'modules/boards/styles/item';
import { Content, ItemIndicator } from 'modules/boards/styles/stage';
import { renderAmount } from 'modules/boards/utils';
import Icon from 'modules/common/components/Icon';
import { __, getUserAvatar } from 'modules/common/utils';
import React from 'react';

import { IOptions } from 'modules/boards/types';
import { IDeal } from '../types';

type Props = {
  stageId: string;
  item: IDeal;
  isFormVisible: boolean;
  isDragging: boolean;
  provided;
  onTogglePopup: () => void;
  options?: IOptions;
};

class DealItem extends React.PureComponent<Props, {}> {
  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  renderForm = () => {
    const { onTogglePopup, isFormVisible, stageId, item, options } = this.props;

    if (!isFormVisible) {
      return null;
    }

    return (
      <EditForm
        options={options}
        stageId={stageId}
        itemId={item._id}
        closeModal={onTogglePopup}
      />
    );
  };

  render() {
    const { item, isDragging, provided, onTogglePopup } = this.props;
    const products = (item.products || []).map(p => p.product);
    const { customers, companies } = item;

    return (
      <ItemContainer
        isDragging={isDragging}
        innerRef={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Content onClick={onTogglePopup}>
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

export default DealItem;
