import dayjs from 'dayjs';
import {
  ActivityContent,
  ActivityDate,
  AvatarWrapper,
  FlexBody,
  FlexCenterContent,
  LogWrapper
} from 'modules/activityLogs/styles';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import Form from 'modules/internalNotes/components/Form';
import { IInternalNote } from 'modules/internalNotes/types';
import React from 'react';
import xss from 'xss';

type Props = {
  activity: any;
  edit: (variables, callback: () => void) => void;
  internalNote: IInternalNote;
  isLoading: boolean;
};

class InternalNote extends React.Component<Props, { editing: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };
  }

  onEditing = () => {
    this.setState({ editing: !this.state.editing });
  };

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

  renderContent() {
    const { internalNote, isLoading, edit } = this.props;
    const { content } = internalNote;

    if (this.state.editing) {
      return (
        <Form
          save={edit}
          isActionLoading={isLoading}
          content={content}
          callback={this.onEditing}
        />
      );
    }

    return (
      <ActivityContent
        isInternalNote={true}
        dangerouslySetInnerHTML={{ __html: xss(content) }}
        onClick={this.onEditing}
      />
    );
  }

  render() {
    const { internalNote } = this.props;

    return (
      <LogWrapper>
        <FlexCenterContent>
          <AvatarWrapper>
            <NameCard.Avatar />
          </AvatarWrapper>
          <FlexBody>{this.renderBody()}</FlexBody>
          <Tip text={dayjs(internalNote.createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(internalNote.createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
        {this.renderContent()}
      </LogWrapper>
    );
  }
}

export default InternalNote;
