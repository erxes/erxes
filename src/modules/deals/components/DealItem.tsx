import dayjs from 'dayjs';
import DueDateLabel from 'modules/boards/components/DueDateLabel';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemDate } from 'modules/boards/styles/common';
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
  beforePopupClose: () => void;
  onClick: () => void;
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
    const { stageId, item, options, beforePopupClose } = this.props;

    return (
      <EditForm
        beforePopupClose={beforePopupClose}
        options={options}
        stageId={stageId}
        itemId={item._id}
        hideHeader={true}
      />
    );
  };

  render() {
    const { item, onClick } = this.props;
    const products = (item.products || []).map(p => p.product);
    const { customers, companies, closeDate, isComplete } = item;

    return (
      <>
        <Content onClick={onClick}>
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

          <DueDateLabel closeDate={closeDate} isComplete={isComplete} />

          <Footer>
            {item.isWatched ? <Icon icon="eye" /> : __('Last updated')}
            <Right>{this.renderDate(item.modifiedAt)}</Right>
          </Footer>
        </Content>

        {this.renderForm()}
      </>
    );
  }
}

export default DealItem;
