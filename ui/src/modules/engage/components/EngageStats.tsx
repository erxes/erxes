import Attachment from 'modules/common/components/Attachment';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import {
  FlexRow,
  Subject
} from 'modules/settings/integrations/components/mail/styles';
import React from 'react';
import { METHODS, SMS_DELIVERY_STATUSES } from '../constants';
import {
  Box,
  BoxContent,
  BoxHeader,
  FlexContainer,
  Half,
  IconContainer,
  PreviewContent,
  RightSection,
  Shell,
  Title
} from '../styles';
import { IEngageMessage, IEngageSmsStats, IEngageStats } from '../types';

type Props = {
  message: IEngageMessage;
};

class EmailStatistics extends React.Component<Props> {
  renderBox(icon, name, type) {
    return (
      <Box>
        <BoxHeader>
          <IconContainer>
            <Icon icon={icon} />
          </IconContainer>
        </BoxHeader>
        <BoxContent>
          <h5>{name}</h5>
          {type || 0}
        </BoxContent>
      </Box>
    );
  }

  renderAttachments() {
    const { email } = this.props.message;

    if (!email || (email.attachments && email.attachments.length === 0)) {
      return null;
    }

    return (
      <Subject noBorder={true}>
        <FlexRow>
          <label>Attachments:</label>

          {(email.attachments || []).map((attachment, index) => (
            <Attachment key={index} attachment={attachment} />
          ))}
        </FlexRow>
      </Subject>
    );
  }

  getSubject() {
    const { message } = this.props;

    if (message.method === METHODS.EMAIL) {
      return message.email && message.email.subject;
    }

    if (message.method === METHODS.SMS) {
      return message.shortMessage && message.shortMessage.from;
    }

    return null;
  }

  getContent() {
    const { message } = this.props;

    if (message.method === METHODS.EMAIL) {
      return message.email && message.email.content;
    }

    if (message.method === METHODS.SMS) {
      return message.shortMessage && message.shortMessage.content;
    }

    return '';
  }

  renderLeft() {
    const { message } = this.props;
    const { fromIntegration, fromUser } = message;

    let from;

    if (fromUser) {
      from = fromUser.details ? fromUser.details.fullName : fromUser.email;
    }

    if (fromIntegration) {
      from = fromIntegration.name;
    }

    return (
      <Half>
        <Subject>
          <FlexRow>
            <label>{__('From')}:</label>
            <strong>{from}</strong>
          </FlexRow>
        </Subject>
        <Subject>
          <FlexRow>
            <label>{__('Subject')}:</label>
            {this.getSubject()}
          </FlexRow>
        </Subject>
        <Subject noBorder={true}>
          <FlexRow>
            <label>{__('Content')}:</label>
          </FlexRow>
          <PreviewContent
            isFullmessage={false}
            showOverflow={true}
            dangerouslySetInnerHTML={{
              __html: this.getContent() || ''
            }}
          />
        </Subject>
        {this.renderAttachments()}
      </Half>
    );
  }

  renderEmailStats() {
    const { stats } = this.props.message;
    const emailStats = stats || ({} as IEngageStats);

    if (this.props.message.method !== METHODS.EMAIL) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderBox('cube-2', 'Total', emailStats.total)}
        {this.renderBox('telegram-alt', 'Sent', emailStats.send)}
        {this.renderBox('comment-check', 'Delivered', emailStats.delivery)}
        {this.renderBox('envelope-open', 'Opened', emailStats.open)}
        {this.renderBox('mouse-alt', 'Clicked', emailStats.click)}
        {this.renderBox('frown', 'Complaint', emailStats.complaint)}
        {this.renderBox('arrows-up-right', 'Bounce', emailStats.bounce)}
        {this.renderBox(
          'ban',
          'Rendering failure',
          emailStats.renderingfailure
        )}
        {this.renderBox('times-circle', 'Rejected', emailStats.reject)}
      </React.Fragment>
    );
  }

  renderSmsStats() {
    const { smsStats } = this.props.message;
    const stats = smsStats || ({} as IEngageSmsStats);

    if (this.props.message.method !== METHODS.SMS) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderBox('cube-2', 'Total', stats.total)}
        {this.renderBox('list-ul', SMS_DELIVERY_STATUSES.QUEUED, stats.queued)}
        {this.renderBox(
          'comment-alt-message',
          SMS_DELIVERY_STATUSES.SENDING,
          stats.sending
        )}
        {this.renderBox('send', SMS_DELIVERY_STATUSES.SENT, stats.sent)}
        {this.renderBox(
          'checked',
          SMS_DELIVERY_STATUSES.DELIVERED,
          stats.delivered
        )}
        {this.renderBox(
          'comment-alt-block',
          SMS_DELIVERY_STATUSES.SENDING_FAILED,
          stats.sending_failed
        )}
        {this.renderBox(
          'multiply',
          SMS_DELIVERY_STATUSES.DELIVERY_FAILED,
          stats.delivery_failed
        )}
        {this.renderBox(
          'comment-alt-question',
          SMS_DELIVERY_STATUSES.DELIVERY_UNCONFIRMED,
          stats.delivery_unconfirmed
        )}
      </React.Fragment>
    );
  }

  render() {
    const { message } = this.props;
    const logs = message.logs || [];

    const actionBar = (
      <Wrapper.ActionBar left={<Title>{this.props.message.title}</Title>} />
    );

    const content = (
      <FlexContainer>
        {this.renderLeft()}
        <Half>
          <RightSection>
            {this.renderEmailStats()}
            {this.renderSmsStats()}
            <Shell>
              <div className="shell-wrap">
                <p className="shell-top-bar">Log messages</p>
                <ul className="shell-body">
                  {logs.map((log, index) => (
                    <li key={index}>{log.message}</li>
                  ))}
                </ul>
              </div>
            </Shell>
          </RightSection>
        </Half>
      </FlexContainer>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Show statistics')}
            breadcrumb={[
              { title: __('Engage'), link: '/engage' },
              { title: __('Show statistics') }
            ]}
          />
        }
        actionBar={actionBar}
        content={content}
      />
    );
  }
}

export default EmailStatistics;
