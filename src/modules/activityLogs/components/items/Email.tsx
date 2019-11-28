import dayjs from 'dayjs';
import {
  ActivityDate,
  AvatarWrapper,
  ContentShadow,
  EmailContent,
  ExpandButton,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { ControlLabel } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { IEngageEmail, IEngageMessage } from 'modules/engage/types';
import React from 'react';
import xss from 'xss';

type Props = {
  engageMessage: IEngageMessage;
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
    const { email = {} as IEngageEmail } = this.props.engageMessage;
    const { content } = email;

    const { expand } = this.state;
    const longEmail = content.length >= 800;

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
              <Icon icon={expand ? 'uparrow-2' : 'downarrow'} />
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
      title,
      fromUser
    } = this.props.engageMessage;
    const { subject } = email;
    // tslint:disable-next-line:no-console
    console.log(this.props.engageMessage);
    return (
      <>
        <FlexCenterContent>
          <AvatarWrapper>
            <NameCard.Avatar size={32} />
          </AvatarWrapper>
          <FlexBody>
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
