import Attachment from 'modules/common/components/Attachment';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import {
  FlexRow,
  Subject
} from 'modules/settings/integrations/components/mail/styles';
import React from 'react';
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
import { IEngageMessage, IEngageStats } from '../types';

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

  renderLeft() {
    const { message } = this.props;

    return (
      <Half>
        <Subject>
          <FlexRow>
            <label>{__('From')}:</label>
            <strong>
              {message.fromUser.details
                ? message.fromUser.details.fullName
                : message.fromUser.email}
            </strong>
          </FlexRow>
        </Subject>
        <Subject>
          <FlexRow>
            <label>{__('Subject')}:</label>
            {message.email && message.email.subject}
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
              __html: message.email ? message.email.content : ''
            }}
          />
        </Subject>
        {this.renderAttachments()}
      </Half>
    );
  }

  render() {
    const { message } = this.props;
    if (!message) {
      return <EmptyState text="Message not found" icon="web-section-alt" />;
    }
    const stats = message.stats || ({} as IEngageStats);
    const logs = message.logs || [];
    const totalCount = stats.total;

    const actionBar = (
      <Wrapper.ActionBar left={<Title>{this.props.message.title}</Title>} />
    );

    const content = (
      <FlexContainer>
        {this.renderLeft()}
        <Half>
          <RightSection>
            {this.renderBox('cube-2', 'Total', totalCount)}
            {this.renderBox('telegram-alt', 'Sent', stats.send)}
            {this.renderBox('comment-check', 'Delivered', stats.delivery)}
            {this.renderBox('envelope-open', 'Opened', stats.open)}
            {this.renderBox('mouse-alt', 'Clicked', stats.click)}
            {this.renderBox('frown', 'Complaint', stats.complaint)}
            {this.renderBox('arrows-up-right', 'Bounce', stats.bounce)}
            {this.renderBox('ban', 'Rendering failure', stats.renderingfailure)}
            {this.renderBox('times-circle', 'Rejected', stats.reject)}

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
