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
  Email,
  EngageBox,
  Half,
  IconContainer,
  PreviewContent,
  RightSection
} from '../styles';
import { IEngageMessage, IEngageStats } from '../types';

const { Section } = Wrapper.Sidebar;

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

  renderLeft() {
    const { message } = this.props;

    return (
      <Half>
        <Subject hasMargin={true}>
          <FlexRow>
            <label>From:</label>
            <Email>
              {message.fromUser.details
                ? message.fromUser.details.fullName
                : message.fromUser.email}
            </Email>
          </FlexRow>
          <FlexRow>
            <label>Title:</label>
            <>{message.title}</>
          </FlexRow>
        </Subject>
        <Subject hasMargin={true}>
          <FlexRow>
            <label>Subject:</label>
            {message.email && message.email.subject}
          </FlexRow>
        </Subject>
        <Subject hasMargin={true}>
          <FlexRow>
            <label>Content:</label>
          </FlexRow>
          <PreviewContent
            isFullmessage={false}
            dangerouslySetInnerHTML={{
              __html: message.email ? message.email.content : ''
            }}
          />
        </Subject>
      </Half>
    );
  }

  render() {
    const stats = this.props.message.stats || ({} as IEngageStats);
    const totalCount = stats.total;

    const content = (
      <>
        <Section.Title>Engage statistics</Section.Title>
        <EngageBox>
          {this.renderLeft()}
          <Half>
            <RightSection>
              {this.renderBox('cube', 'Total', totalCount)}
              {this.renderBox('paper-plane-1', 'Sent', stats.send)}
              {this.renderBox('checked', 'Delivered', stats.delivery)}
              {this.renderBox('openlock', 'Opened', stats.open)}
              {this.renderBox('clicker', 'Clicked', stats.click)}
              {this.renderBox('sad', 'Complaint', stats.complaint)}
              {this.renderBox('basketball', 'Bounce', stats.bounce)}
              {this.renderBox(
                'dislike',
                'Rendering failure',
                stats.renderingfailure
              )}
              {this.renderBox('cancel', 'Rejected', stats.reject)}
            </RightSection>
          </Half>
        </EngageBox>
      </>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Show statistics')}
            breadcrumb={[{ title: __('Show statistics') }]}
          />
        }
        content={content}
      />
    );
  }
}

export default EmailStatistics;
