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
import Label from 'modules/common/components/Label';
import Tip from 'modules/common/components/Tip';
import { IEngageEmail, IEngageMessage } from 'modules/engage/types';
import React from 'react';
import xss from 'xss';

type Props = {
  email: IEngageMessage;
  emailType: string;
  activity: any;
};

class EngageEmail extends React.Component<Props, { expand: boolean }> {
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
    const { email = {} as IEngageEmail } = this.props.email;
    const { content } = email;
    const { expand } = this.state;
    const longEmail = content.length >= 1500;

    return (
      <>
        <EmailContent
          longEmail={longEmail}
          expand={expand}
          dangerouslySetInnerHTML={{ __html: xss(content) }}
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

    const {
      email = {} as IEngageEmail,
      validCustomersCount,
      title,
      fromUser,
      stats = { send: 0, total: 0 }
    } = this.props.email;

    const { subject } = email;

    let status = <Label lblStyle="default">Sending</Label>;

    if (validCustomersCount === stats.total) {
      status = <Label lblStyle="success">Sent</Label>;
    }

    return (
      <>
        <FlexCenterContent>
          <FlexBody>
            <p>Engage email</p>
            <p>{subject}</p>
            <div>
              <ControlLabel>Title</ControlLabel>: <span>{title}</span>
              <ControlLabel>From</ControlLabel>:{' '}
              <span>
                {fromUser.details ? (
                  <>
                    <b>{fromUser.details.fullName}</b>
                    <i>({fromUser.email})</i>
                  </>
                ) : (
                  fromUser.email
                )}
              </span>
            </div>
          </FlexBody>
          {status}
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

export default EngageEmail;
