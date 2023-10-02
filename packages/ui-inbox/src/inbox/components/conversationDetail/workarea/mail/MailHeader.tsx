import * as React from 'react';

import {
  ActionButton,
  AddressContainer,
  Addresses,
  Date,
  Details,
  From,
  Meta,
  RightSide,
  Title
} from './style';
import { IMail, IMessage } from '../../../../types';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { Flex } from '@erxes/ui/src/styles/main';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';

type Props = {
  message: IMessage;
  isContentCollapsed: boolean;
  onToggleContent: () => void;
  onToggleMailForm: (event, replyToAll?: boolean, isForward?: boolean) => void;
};

type State = {
  dateFormat: string;
  isDetailExpanded: boolean;
};

class MailHeader extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      dateFormat: 'MMM D, h:mm A',
      isDetailExpanded: false
    };
  }

  toggleDateFormat = e => {
    e.stopPropagation();

    this.setState({
      dateFormat: this.state.dateFormat === 'lll' ? 'MMM D, h:mm A' : 'lll'
    });
  };

  toggleExpand = e => {
    if (this.props.isContentCollapsed) {
      return;
    }

    e.stopPropagation();
    this.setState({ isDetailExpanded: !this.state.isDetailExpanded });
  };

  onToggleMailForm = ({
    event,
    replyToAll = false,
    isForward = false
  }: {
    event: any;
    replyToAll?: boolean;
    isForward?: boolean;
  }) => {
    event.stopPropagation();

    this.props.onToggleMailForm(event, replyToAll, isForward);
  };

  renderTopButton = () => {
    if (this.props.isContentCollapsed) {
      return null;
    }

    const onToggleReply = event => this.onToggleMailForm({ event });
    const onToggleReplyAll = event =>
      this.onToggleMailForm({ event, replyToAll: true });
    const onToggleForward = event =>
      this.onToggleMailForm({ event, isForward: true });

    return (
      <>
        <Tip text={__('Reply')} placement="bottom">
          <ActionButton onClick={onToggleReply}>
            <Icon icon="reply" />
          </ActionButton>
        </Tip>
        <Dropdown alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-engage">
            <ActionButton>
              <Icon icon="ellipsis-v" />
            </ActionButton>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a onClick={onToggleReply}>Reply</a>
            </li>
            <li>
              <a onClick={onToggleReplyAll}>Reply all</a>
            </li>
            <li>
              <a onClick={onToggleForward}>Forward</a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  };

  renderRightSide(hasAttachments: boolean, createdAt: Date) {
    return (
      <RightSide>
        <Date onClick={this.toggleDateFormat}>
          {dayjs(createdAt).format(this.state.dateFormat)}
        </Date>
        {hasAttachments && <Icon icon="paperclip" />}
        {this.renderTopButton()}
      </RightSide>
    );
  }

  renderAddress(title: string, values: any) {
    if (!values || values.length === 0) {
      return null;
    }

    const { length } = values;

    const emails = values.map((val, idx) => (
      <React.Fragment key={idx}>
        <span>{val.email}</span>
        {length - 1 !== idx && `,${' '}`}
      </React.Fragment>
    ));

    return (
      <Flex>
        <Title>{title}</Title>
        <Addresses>{emails}</Addresses>
      </Flex>
    );
  }

  renderCustomer = (fromEmail: string) => {
    const { customer = {} as ICustomer } = this.props.message;

    if (!customer) {
      return null;
    }

    if (customer.firstName === fromEmail) {
      return (
        <div>
          <strong>{fromEmail}</strong>
        </div>
      );
    }

    return (
      <div>
        <strong>{customer.firstName}</strong>{' '}
        <From>
          {'<'}
          {fromEmail}
          {'>'}
        </From>
      </div>
    );
  };

  renderSecondaryContent = mailData => {
    const { message, isContentCollapsed } = this.props;

    if (isContentCollapsed) {
      // remove all tags and convert plain text
      const plainContent = (message.content || '').trim();

      return <div>{plainContent.substring(0, 100)}...</div>;
    }

    return (
      <AddressContainer isExpanded={this.state.isDetailExpanded}>
        {this.renderAddress('To:', mailData.to)}
        {this.renderAddress('Cc:', mailData.cc)}
        {this.renderAddress('Bcc:', mailData.bcc)}
      </AddressContainer>
    );
  };

  renderDetails(mailData) {
    const [from] = mailData.from || [{}];

    return (
      <Details
        onClick={this.toggleExpand}
        clickable={!this.props.isContentCollapsed}
      >
        {this.renderCustomer(from.email || '')}
        {this.renderSecondaryContent(mailData)}
      </Details>
    );
  }

  render() {
    const { message, isContentCollapsed, onToggleContent } = this.props;
    const { customer, createdAt, mailData = {} as IMail } = message;
    const hasAttachments = mailData
      ? (mailData.attachments || []).length > 0
      : false;

    return (
      <Meta toggle={isContentCollapsed} onClick={onToggleContent}>
        <NameCard.Avatar customer={customer} size={32} letterCount={1} />
        {this.renderDetails(mailData)}
        {this.renderRightSide(hasAttachments, createdAt)}
      </Meta>
    );
  }
}

export default MailHeader;
