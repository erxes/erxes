import dayjs from 'dayjs';
import DueDateLabel from 'modules/boards/components/DueDateLabel';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemDate } from 'modules/boards/styles/common';
import { Footer, PriceContainer, Right } from 'modules/boards/styles/item';
import { Content, ItemIndicator } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderPriority } from 'modules/boards/utils';
import { __ } from 'modules/common/utils';
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import React from 'react';
import { ITicket } from '../types';

type Props = {
  stageId: string;
  item: ITicket;
  onClick: () => void;
  beforePopupClose: () => void;
  options?: IOptions;
  isFormVisible: boolean;
};

class TicketItem extends React.PureComponent<Props> {
  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  renderForm = () => {
    const {
      beforePopupClose,
      stageId,
      item,
      options,
      isFormVisible
    } = this.props;

    if (!isFormVisible) {
      return null;
    }

    return (
      <EditForm
        stageId={stageId}
        itemId={item._id}
        beforePopupClose={beforePopupClose}
        options={options}
        hideHeader={true}
        isPopupVisible={isFormVisible}
      />
    );
  };

  render() {
    const { item, onClick } = this.props;
    const { customers, companies, closeDate, isComplete } = item;

    return (
      <>
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
              <Participators participatedUsers={item.assignedUsers} limit={3} />
            </Right>
          </PriceContainer>

          <DueDateLabel closeDate={closeDate} isComplete={isComplete} />

          <Footer>
            {__('Last updated')}:
            <Right>{this.renderDate(item.modifiedAt)}</Right>
          </Footer>
        </Content>
        {this.renderForm()}
      </>
    );
  }
}

export default TicketItem;
