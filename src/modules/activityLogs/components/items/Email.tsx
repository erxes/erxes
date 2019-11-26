import dayjs from 'dayjs';
import {
  ActivityDate,
  AvatarWrapper,
  ContentShadow,
  DeleteAction,
  EmailContent,
  ExpandButton,
  FlexBody,
  FlexCenterContent,
  LogWrapper
} from 'modules/activityLogs/styles';
import Icon from 'modules/common/components/Icon';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { IEmailDeliveryDetail } from 'modules/engage/types';
import React from 'react';
import xss from 'xss';

type Props = {
  email: IEmailDeliveryDetail;
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
    const { content } = this.props.email;
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
    const { subject, title } = this.props.email;

    return (
      <LogWrapper>
        <FlexCenterContent>
          <AvatarWrapper>
            <NameCard.Avatar size={32} />
          </AvatarWrapper>
          <FlexBody>
            <p>{subject}</p>
            <div>
              To: <span>test@gmai.com</span>
              Title: <span>{title}</span>
            </div>
          </FlexBody>
          <DeleteAction>Delete</DeleteAction>
          <Tip text={dayjs(createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
        {this.renderContent()}
      </LogWrapper>
    );
  }
}

export default Email;
