import dayjs from 'dayjs';
import {
  ActivityContent,
  ActivityDate,
  AvatarWrapper,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
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

    return (
      <>
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
      </>
    );
  }
}

export default InternalNote;
