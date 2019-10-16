import dayjs from 'dayjs';
import Details from 'modules/boards/components/Details';
import DueDateLabel from 'modules/boards/components/DueDateLabel';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import { Footer, PriceContainer, Right } from 'modules/boards/styles/item';
import { Content } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderPriority } from 'modules/boards/utils';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import React from 'react';
import { ITicket } from '../types';

type Props = {
  stageId: string;
  item: ITicket;
  onClick?: () => void;
  beforePopupClose?: () => void;
  options?: IOptions;
  portable?: boolean;
  onAdd?: (stageId: string, item: ITicket) => void;
  onRemove?: (dealId: string, stageId: string) => void;
  onUpdate?: (item: ITicket) => void;
};

class TicketItem extends React.PureComponent<
  Props,
  { isPopupVisible: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false
    };
  }

  beforePopupClose = () => {
    if (this.props.beforePopupClose) {
      this.props.beforePopupClose();
    } else {
      this.setState({ isPopupVisible: false });
    }
  };

  renderDate(date, format = 'YYYY-MM-DD') {
    if (!date) {
      return null;
    }

    return (
      <Tip text={dayjs(date).format(format)}>
        <ItemDate>{dayjs(date).format('lll')}</ItemDate>
      </Tip>
    );
  }

  renderForm = () => {
    const { item } = this.props;

    return (
      <EditForm
        {...this.props}
        itemId={item._id}
        beforePopupClose={this.beforePopupClose}
        hideHeader={true}
        isPopupVisible={this.state.isPopupVisible}
      />
    );
  };

  renderContent() {
    const { item } = this.props;
    const { customers, companies, closeDate, isComplete } = item;

    return (
      <>
        <h5>
          {renderPriority(item.priority)}
          {item.name}
        </h5>

        <Details color="#F7CE53" items={customers || []} />
        <Details color="#EA475D" items={companies || []} />

        <PriceContainer>
          <Right>
            <Participators participatedUsers={item.assignedUsers} limit={3} />
          </Right>
        </PriceContainer>

        <DueDateLabel closeDate={closeDate} isComplete={isComplete} />

        <Footer>
          {__('Last updated')}:<Right>{this.renderDate(item.modifiedAt)}</Right>
        </Footer>
      </>
    );
  }

  render() {
    const { portable } = this.props;

    if (portable) {
      const onClick = () => {
        this.setState({ isPopupVisible: true });
      };

      return (
        <>
          <ItemContainer onClick={onClick}>
            <Content>{this.renderContent()}</Content>
          </ItemContainer>
          {this.renderForm()}
        </>
      );
    }

    return (
      <>
        <Content onClick={this.props.onClick}>{this.renderContent()}</Content>
        {this.renderForm()}
      </>
    );
  }
}

export default TicketItem;
