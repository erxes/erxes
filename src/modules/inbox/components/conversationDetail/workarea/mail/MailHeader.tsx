import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import Avatar from 'modules/common/components/nameCard/Avatar';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { IMail, IMessage } from 'modules/inbox/types';
import * as React from 'react';
import { ActionButton, Date, Details, From, Meta, RightSide } from './style';

type Props = {
  message: IMessage;
  isContentCollapsed: boolean;
  onToggleContent: () => void;
  onToggleReply: () => void;
};

type State = {
  dateFormat: string;
};

class MailHeader extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      dateFormat: 'MMM D, h:mm A'
    };
  }

  toggleDateFormat = e => {
    e.stopPropagation();

    this.setState({
      dateFormat: this.state.dateFormat === 'lll' ? 'MMM D, h:mm A' : 'lll'
    });
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

    const emails = values.map((val, idx) => <span key={idx}>{val.email}</span>);

    return (
      <>
        {title} {emails}
      </>
    );
  }

  renderCustomer = (fromEmail: string) => {
    const { customer = {} as ICustomer } = this.props.message;

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

  renderDetails(mailData) {
    const [from] = mailData.from || [{}];

    return (
      <Details>
        {this.renderCustomer(from.email || '')}
        {this.renderAddress('To:', mailData.to)}
        {this.renderAddress('Cc:', mailData.cc)}
        {this.renderAddress('Bcc:', mailData.bcc)}
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
