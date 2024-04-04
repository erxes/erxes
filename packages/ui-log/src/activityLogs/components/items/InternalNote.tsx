import {
  ActivityContent,
  ActivityDate,
  DeleteAction,
  FlexBody,
  FlexCenterContent,
  LogWrapper
} from '../../styles';

import Form from '@erxes/ui-internalnotes/src/components/Form';
import { IInternalNote } from '@erxes/ui-internalnotes/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';
import { renderUserFullName } from '@erxes/ui/src/utils';
import { urlify } from '@erxes/ui/src/utils/urlParser';
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
    const createdUser = internalNote.createdUser || ({} as IUser);

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
    const createdUser = internalNote.createdUser || { _id: '' };

    const isCurrentUserNote = currentUser._id === createdUser._id;

    if (this.state.editing) {
      return (
        <Form
          save={edit}
          isActionLoading={isLoading}
          content={content}
          callback={this.onEditing}
          contentType="activityLog"
          contentTypeId={internalNote._id}
        />
      );
    }

    return (
      <ActivityContent
        isInternalNote={true}
        dangerouslySetInnerHTML={{ __html: xss(urlify(content)) }}
        onClick={isCurrentUserNote ? this.onEditing : undefined}
      />
    );
  }

  render() {
    const { internalNote, remove, currentUser } = this.props;
    const createdUser = internalNote.createdUser || { _id: '' };
    const isCurrentUserNote = currentUser._id === createdUser._id;

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
