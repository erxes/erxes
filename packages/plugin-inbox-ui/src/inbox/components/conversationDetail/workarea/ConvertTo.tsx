import {
  IConversation,
  IMail,
  IMessage
} from '@erxes/ui-inbox/src/inbox/types';

import Button from '@erxes/ui/src/components/Button';
import DealConvertTrigger from '@erxes/ui-cards/src/deals/components/DealConvertTrigger';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import PurchaseConvertTrigger from '@erxes/ui-cards/src/purchases/components/PurchaseConvertTrigger';
import React from 'react';
import TaskConvertTrigger from '@erxes/ui-cards/src/tasks/components/TaskConvertTrigger';
import TicketConvertTrigger from '@erxes/ui-cards/src/tickets/components/TicketConvertTrigger';
import { __ } from '@erxes/ui/src/utils/core';
import styled from 'styled-components';

const Container = styled.div`
  display: inline-block;

  .dropdown-menu {
    min-width: auto;
  }

  .dropdown-menu li button {
    width: 100%;
    text-align: left;
    border-radius: 0;
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
  keysPressed: any;
  showDropdown: boolean;
};

export default class ConvertTo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      cursor: 0,
      keysPressed: {},
      showDropdown: false
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('keydown', this.handleArrowSelection);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('keydown', this.handleArrowSelection);
  }

  handleKeyDown = (event: any) => {
    const { keysPressed } = this.state;
    const key = event.key;
    const showConvertTo = document.getElementById('dropdown-convert-to');

    if (document.getElementsByClassName('modal-dialog').length === 0) {
      this.setState({ keysPressed: { ...keysPressed, [key]: true } }, () => {
        if (
          this.state.keysPressed.Control === true &&
          event.keyCode === 50 &&
          showConvertTo
        ) {
          showConvertTo.click();
          this.setState({ showDropdown: !this.state.showDropdown });
        }
      });
    }
  };

  handleKeyUp = (event: any) => {
    delete this.state.keysPressed[event.key];

    if (document.getElementsByClassName('modal-dialog').length === 0) {
      this.setState({ keysPressed: { ...this.state.keysPressed } });
    }
  };

  handleArrowSelection = (event: any) => {
    const { cursor } = this.state;

    const maxCursor: number = 4;

    const showTicketConvert = document.getElementById('showTicketConvertModal');
    const showDealConvert = document.getElementById('showDealConvertModal');
    const showTaskConvert = document.getElementById('showTaskConvertModal');
    const showPurchaseConvert = document.getElementById(
      'showPurchaseConvertModal'
    );

    switch (event.keyCode) {
      case 13:
        if (document.getElementsByClassName('modal-dialog').length === 0) {
          if (this.state.showDropdown && cursor === 0 && showTicketConvert) {
            showTicketConvert.click();
          }
          if (this.state.showDropdown && cursor === 1 && showDealConvert) {
            showDealConvert.click();
          }
          if (this.state.showDropdown && cursor === 2 && showTaskConvert) {
            showTaskConvert.click();
          }
          if (this.state.showDropdown && cursor === 3 && showPurchaseConvert) {
            showPurchaseConvert.click();
          }
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
        <Dropdown
          show={this.state.showDropdown}
          onToggle={() =>
            this.setState({ showDropdown: !this.state.showDropdown })
          }
        >
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
            <Button
              size="small"
              btnStyle="simple"
              onClick={() =>
                this.setState({ showDropdown: !this.state.showDropdown })
              }
            >
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
