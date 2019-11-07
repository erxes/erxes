import dayjs from 'dayjs';
import { ACTIVITY_LOG_ITEMS_STYLES } from 'modules/activityLogs/constants';
import {
  ActivityContent,
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  AvatarWrapper,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import Icon from 'modules/common/components/Icon';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { IInternalNote } from 'modules/internalNotes/types';
import React from 'react';
import xss from 'xss';

const { INTERNAl_NOTE } = ACTIVITY_LOG_ITEMS_STYLES;

type Props = {
  activity: any;
  internalNote: IInternalNote;
};

class InternalNote extends React.Component<Props> {
  renderBody = () => {
    const { activity } = this.props;
    const { createdUser } = activity;

    let userName = 'Unknown';

    if (createdUser) {
      userName = createdUser.details ? createdUser.details.fullName : 'Unknown';
    }
    return (
      <span>
        <strong>{userName}</strong> left a note
      </span>
    );
  };

  render() {
    const { internalNote, activity } = this.props;
    const { content } = internalNote;

    return (
      <ActivityRow key={Math.random()}>
        <ActivityIcon color={INTERNAl_NOTE.color}>
          <Icon icon={INTERNAl_NOTE.icon} />
        </ActivityIcon>
        <React.Fragment>
          <FlexContent>
            <AvatarWrapper>
              <NameCard.Avatar />
            </AvatarWrapper>
            <FlexBody>{this.renderBody()}</FlexBody>
            <Tip text={dayjs(activity.createdAt).format('llll')}>
              <ActivityDate>
                {dayjs(activity.createdAt).format('MMM D, h:mm A')}
              </ActivityDate>
            </Tip>
          </FlexContent>
          <ActivityContent
            isInternalNote={true}
            dangerouslySetInnerHTML={{ __html: xss(content) }}
          />
        </React.Fragment>
      </ActivityRow>
    );
  }
}

export default InternalNote;
