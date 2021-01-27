import Attachment from 'modules/common/components/Attachment';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import {
  FlexRow,
  Subject
} from 'modules/settings/integrations/components/mail/styles';
import React from 'react';
import {
  AWS_EMAIL_DELIVERY_STATUSES,
  METHODS,
  SMS_DELIVERY_STATUSES
} from '../constants';
import {
  FlexContainer,
  Half,
  PreviewContent,
  RightSection,
  Shell,
  Title
} from '../styles';
import { IEngageMessage, IEngageSmsStats, IEngageStats } from '../types';
import StatItem from './EngageStatItem';

type Props = {
  message: IEngageMessage;
};

class EmailStatistics extends React.Component<Props> {
  renderBox(method: string, count: number, totalCount?: number, kind?: string) {
    return (
      <StatItem
        count={count}
        totalCount={totalCount}
        method={method}
        kind={kind}
      />
    );
  }

  renderEmailBox(count: number, totalCount?: number, kind?: string) {
    return this.renderBox(METHODS.EMAIL, count, totalCount, kind);
  }

  renderSmsBox(count: number, totalCount?: number, kind?: string) {
    return this.renderBox(METHODS.SMS, count, totalCount, kind);
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
        {this.renderEmailBox(emailStats.total)}
        {this.renderEmailBox(
          emailStats.send,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.SEND
        )}
        {this.renderEmailBox(
          emailStats.delivery,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.DELIVERY
        )}
        {this.renderEmailBox(
          emailStats.open,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.OPEN
        )}
        {this.renderEmailBox(
          emailStats.click,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.CLICK
        )}
        {this.renderEmailBox(
          emailStats.complaint,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.COMPLAINT
        )}
        {this.renderEmailBox(
          emailStats.bounce,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.BOUNCE
        )}
        {this.renderEmailBox(
          emailStats.renderingfailure,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.RENDERING_FAILURE
        )}
        {this.renderEmailBox(
          emailStats.reject,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.REJECT
        )}
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
        {this.renderSmsBox(stats.total)}
        {this.renderSmsBox(
          stats.queued,
          stats.total,
          SMS_DELIVERY_STATUSES.QUEUED
        )}
        {this.renderSmsBox(
          stats.sending,
          stats.total,
          SMS_DELIVERY_STATUSES.SENDING
        )}
        {this.renderSmsBox(stats.sent, stats.total, SMS_DELIVERY_STATUSES.SENT)}
        {this.renderSmsBox(
          stats.delivered,
          stats.total,
          SMS_DELIVERY_STATUSES.DELIVERED
        )}
        {this.renderSmsBox(
          stats.sending_failed,
          stats.total,
          SMS_DELIVERY_STATUSES.SENDING_FAILED
        )}
        {this.renderSmsBox(
          stats.delivery_failed,
          stats.total,
          SMS_DELIVERY_STATUSES.DELIVERY_FAILED
        )}
        {this.renderSmsBox(
          stats.delivery_unconfirmed,
          stats.total,
          SMS_DELIVERY_STATUSES.DELIVERY_UNCONFIRMED
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
              { title: __('Campaigns'), link: '/campaigns' },
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
