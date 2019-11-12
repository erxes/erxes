import dayjs from 'dayjs';
import {
  ActivityContent,
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  AvatarWrapper,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { getIconAndColor } from 'modules/activityLogs/utils';
import Icon from 'modules/common/components/Icon';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { IInternalNote } from 'modules/internalNotes/types';
import React from 'react';
import xss from 'xss';

type Props = {
  activity: any;
  internalNote: IInternalNote;
};

class InternalNote extends React.Component<Props> {
  renderBody = () => {
    const { internalNote } = this.props;
    const { createdUser } = internalNote;

    let userName = 'Unknown';

    if (createdUser.details) {
      userName = createdUser.details.fullName || 'Unknown';
    }

    return (
      <span>
        <strong>{userName}</strong> left a note
      </span>
    );
  };

  render() {
    const { internalNote } = this.props;
    const { content } = internalNote;

    const iconAndColor = getIconAndColor('note');

    return (
      <ActivityRow key={Math.random()}>
        <ActivityIcon color={iconAndColor.color}>
          <Icon icon={iconAndColor.icon} />
        </ActivityIcon>
        <React.Fragment>
          <FlexContent>
            <AvatarWrapper>
              <NameCard.Avatar />
            </AvatarWrapper>
            <FlexBody>{this.renderBody()}</FlexBody>
            <Tip text={dayjs(internalNote.createdAt).format('llll')}>
              <ActivityDate>
                {dayjs(internalNote.createdAt).format('MMM D, h:mm A')}
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
