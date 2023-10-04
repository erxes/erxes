import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import DealConvertTrigger from '@erxes/ui-cards/src/deals/components/DealConvertTrigger';
import TaskConvertTrigger from '@erxes/ui-cards/src/tasks/components/TaskConvertTrigger';
import PurchaseConvertTrigger from '@erxes/ui-cards/src/purchases/components/PurchaseConvertTrigger';
import TicketConvertTrigger from '@erxes/ui-cards/src/tickets/components/TicketConvertTrigger';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import {
  IMessage,
  IConversation,
  IMail
} from '@erxes/ui-inbox/src/inbox/types';

const Container = styled.div`
  display: inline-block;

  .dropdown-menu {
    min-width: auto;
  }

  button {
    padding: 3px 7px 3px 12px;
    font-size: 10px;
  }

  li {
    &.active {
      color: rgb(55, 55, 55);
      background: rgb(240, 240, 240);
      outline: 0px;
    }
  }
`;

type Props = {
  conversation: IConversation;
  conversationMessage: IMessage;
  convertToInfo: {
    ticketUrl?: string;
    dealUrl?: string;
    taskUrl?: string;
    purchaseUrl?: string;
  };
  refetch: () => void;
};

type State = {
  cursor: number;
};

export default class ConvertTo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      cursor: 0
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleArrowSelection);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleArrowSelection);
  }

  handleArrowSelection = (event: any) => {
    const { cursor } = this.state;

    const maxCursor: number = 4;

    const dropdownOpen = document
      .getElementById('convert-dropdown')
      .className.includes('show');

    switch (event.keyCode) {
      case 13:
        if (dropdownOpen && cursor === 0) {
          window.location.hash = 'showTicketConvertModal';
        }
        if (dropdownOpen && cursor === 1) {
          window.location.hash = 'showDealConvertModal';
        }
        if (dropdownOpen && cursor === 2) {
          window.location.hash = 'showTaskConvertModal';
        }
        if (dropdownOpen && cursor === 3) {
          window.location.hash = 'showPurchaseConvertModal';
        }
        break;
      case 38:
        // Arrow move up
        if (cursor > 0) {
          this.setState({ cursor: cursor - 1 });
        } else {
          this.setState({ cursor: maxCursor - 1 });
        }
        break;
      case 40:
        // Arrow move down
        if (cursor < maxCursor - 1) {
          this.setState({ cursor: cursor + 1 });
        } else {
          this.setState({ cursor: 0 });
        }
        break;
      default:
        break;
    }
  };

  render() {
    const {
      conversation,
      convertToInfo,
      conversationMessage,
      refetch
    } = this.props;

    const assignedUserIds = conversation.assignedUserId
      ? [conversation.assignedUserId]
      : [];
    const customerIds = conversation.customerId
      ? [conversation.customerId]
      : [];
    const sourceConversationId = conversation._id;

    const message: IMessage = conversationMessage || ({} as IMessage);
    const mailData = message.mailData || ({} as IMail);

    const triggerProps: any = {
      assignedUserIds,
      relTypeIds: customerIds,
      relType: 'customer',
      sourceConversationId,
      subject: mailData.subject ? mailData.subject : '',
      refetch
    };

    return (
      <Container>
        <Dropdown id="convert-dropdown">
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
            <Button>
              {__('Convert')} <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li
              key="ticket"
              className={this.state.cursor === 0 ? ' active' : ''}
            >
              <TicketConvertTrigger
                {...triggerProps}
                url={convertToInfo.ticketUrl}
                id="convert-item-0"
              />
            </li>
            <li key="deal" className={this.state.cursor === 1 ? ' active' : ''}>
              <DealConvertTrigger
                {...triggerProps}
                bookingProductId={conversation.bookingProductId}
                url={convertToInfo.dealUrl}
                id="convert-item-1"
              />
            </li>
            <li key="task" className={this.state.cursor === 2 ? ' active' : ''}>
              <TaskConvertTrigger
                {...triggerProps}
                url={convertToInfo.taskUrl}
                id="convert-item-2"
              />
            </li>
            <li
              key="purchase"
              className={this.state.cursor === 3 ? ' active' : ''}
            >
              <PurchaseConvertTrigger
                {...triggerProps}
                url={convertToInfo.purchaseUrl}
                id="convert-item-3"
              />
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    );
  }
}
