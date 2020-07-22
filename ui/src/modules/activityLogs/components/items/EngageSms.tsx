import dayjs from 'dayjs';
import {
  ActivityContent,
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { ControlLabel } from 'modules/common/components/form';
import Tip from 'modules/common/components/Tip';
import { IEngageMessage, IEngageSms } from 'modules/engage/types';
import React from 'react';
import xss from 'xss';

type Props = {
  engageSms: IEngageMessage;
  activity: any;
};

class EngageSms extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.state = {
      expand: false
    };
  }

  renderContent() {
    const { shortMessage = {} as IEngageSms } = this.props.engageSms;
    const { content } = shortMessage;

    return (
      <ActivityContent
        isInternalNote={false}
        dangerouslySetInnerHTML={{ __html: xss(content) }}
      />
    );
  }

  render() {
    const { createdAt } = this.props.activity;

    const {
      shortMessage = {} as IEngageSms,
      title,
      fromUser
    } = this.props.engageSms;

    const { from } = shortMessage;

    return (
      <>
        <FlexCenterContent>
          <FlexBody>
            <p>Engage sms</p>
            <p>{from}</p>
            <div>
              <ControlLabel>Title</ControlLabel>: <span>{title}</span>
              <ControlLabel>From</ControlLabel>:{' '}
              <span>
                {fromUser.details ? (
                  <>
                    <b>{fromUser.details.fullName}</b>
                    <i>({fromUser.username})</i>
                  </>
                ) : (
                  fromUser.username
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

export default EngageSms;
