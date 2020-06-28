import dayjs from 'dayjs';
import {
  ActivityContent,
  ActivityDate,
  DeleteAction,
  FlexBody,
  FlexCenterContent,
  LogWrapper
} from 'modules/activityLogs/styles';
import { IUser } from 'modules/auth/types';
import Tip from 'modules/common/components/Tip';
import { renderUserFullName } from 'modules/common/utils';
import Form from 'modules/internalNotes/components/Form';
import { IInternalNote } from 'modules/internalNotes/types';
import React from 'react';
import xss from 'xss';

type Props = {
  activity: any;
  edit: (variables, callback: () => void) => void;
  remove: () => void;
  internalNote: IInternalNote;
  isLoading: boolean;
  currentUser: IUser;
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
      userName = renderUserFullName(createdUser);
    }

    return (
      <span>
        <strong>{userName}</strong> left a note
      </span>
    );
  };

  renderContent() {
    const { internalNote, isLoading, edit, currentUser } = this.props;
    const { content } = internalNote;
    const isCurrentUserNote = currentUser._id === internalNote.createdUser._id;

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
        onClick={isCurrentUserNote ? this.onEditing : undefined}
      />
    );
  }

  render() {
    const { internalNote, remove, currentUser } = this.props;
    const isCurrentUserNote = currentUser._id === internalNote.createdUser._id;

    return (
      <LogWrapper>
        <FlexCenterContent>
          <FlexBody>{this.renderBody()}</FlexBody>
          {isCurrentUserNote && (
            <DeleteAction onClick={remove}>Delete</DeleteAction>
          )}
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
