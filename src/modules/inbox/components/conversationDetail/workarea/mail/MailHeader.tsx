import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import Avatar from 'modules/common/components/nameCard/Avatar';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { IMail, IMessage } from 'modules/inbox/types';
import * as React from 'react';
import * as sanitizeHtml from 'sanitize-html';
import {
  ActionButton,
  AddressContainer,
  Addresses,
  AddressItem,
  Date,
  Details,
  From,
  Meta,
  RightSide,
  Title
} from './style';

type Props = {
  message: IMessage;
  isContentCollapsed: boolean;
  onToggleContent: () => void;
  onToggleReply: () => void;
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

  renderTopButton = () => {
    if (this.props.isContentCollapsed) {
      return null;
    }

    const onToggleReply = e => {
      e.stopPropagation();
      this.props.onToggleReply();
    };

    return (
      <Tip text={__('Reply')} placement="bottom">
        <ActionButton onClick={onToggleReply}>
          <Icon icon="corner-up-left-alt" />
        </ActionButton>
      </Tip>
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
      <>
        <span key={idx}>{val.email}</span>
        {length - 1 !== idx && `,${' '}`}
      </>
    ));

    return (
      <AddressItem>
        <Title>{title}</Title>
        <Addresses>{emails}</Addresses>
      </AddressItem>
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

  renderSubject = (subject: string) => {
    if (!this.state.isDetailExpanded) {
      return null;
    }

    return (
      <AddressItem>
        <Title>{__('Subject')}:</Title>
        <Addresses>{subject}</Addresses>
      </AddressItem>
    );
  };

  renderSecondaryContent = mailData => {
    if (this.props.isContentCollapsed) {
      // remove all tags and convert plain text
      const plainContent = sanitizeHtml(this.props.message.content || '', {
        allowedTags: [],
        allowedAttributes: {}
      }).trim();

      return <div>{plainContent.substring(0, 100)}</div>;
    }

    return (
      <>
        <AddressContainer isExpanded={this.state.isDetailExpanded}>
          {this.renderAddress('To:', mailData.to)}
          {this.renderAddress('Cc:', mailData.cc)}
          {this.renderAddress('Bcc:', mailData.bcc)}
        </AddressContainer>
        {this.renderSubject(mailData.subject || '')}
      </>
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
        <Avatar customer={customer} size={32} />
        {this.renderDetails(mailData)}
        {this.renderRightSide(hasAttachments, createdAt)}
      </Meta>
    );
  }
}

export default MailHeader;
