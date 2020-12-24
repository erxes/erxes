import dayjs from 'dayjs';
import {
  ActivityDate,
  ContentShadow,
  EmailContent,
  ExpandButton,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { ControlLabel } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { IEmailDelivery } from 'modules/engage/types';
import React from 'react';
import xss from 'xss';

type Props = {
  email: IEmailDelivery;
  emailType: string;
  activity: any;
};

class Email extends React.Component<Props, { expand: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      expand: false
    };
  }

  onExpand = () => {
    this.setState({ expand: !this.state.expand });
  };

  renderContent() {
    const { body } = this.props.email;
    const { expand } = this.state;
    const longEmail = body.length >= 1500;

    return (
      <>
        <EmailContent
          longEmail={longEmail}
          expand={expand}
          dangerouslySetInnerHTML={{ __html: xss(body) }}
        />
        {longEmail && (
          <>
            {!expand && <ContentShadow />}
            <ExpandButton onClick={this.onExpand}>
              {expand ? 'Collapse' : 'Expand'}&nbsp;
              <Icon icon={expand ? 'angle-up' : 'angle-down'} />
            </ExpandButton>
          </>
        )}
      </>
    );
  }

  render() {
    const { createdAt } = this.props.activity;
    const { subject, fromEmail, fromUser } = this.props.email;

    const fromUserName = fromUser.details
      ? fromUser.details.fullName
      : 'Unknown';

    return (
      <>
        <FlexCenterContent>
          <FlexBody>
            <strong>{fromUserName} sent email</strong>
            <div>
              <ControlLabel>From</ControlLabel>: <span>{fromEmail}</span>
            </div>
            <div>
              <ControlLabel>Subject</ControlLabel>: <span>{subject}</span>
            </div>
          </FlexBody>

          <Tip text={dayjs(createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
        {this.renderContent()}
      </>
    );
  }
}

export default Email;
