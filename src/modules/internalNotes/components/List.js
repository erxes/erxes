import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NameCard, Button, Icon } from 'modules/common/components';
import {
  ActivityRow,
  AvatarWrapper,
  ActivityWrapper,
  ActivityCaption,
  ActivityContent,
  DeleteNote
} from 'modules/common/components/ActivityList/styles';

const propTypes = {
  notes: PropTypes.array.isRequired,
  currentUserId: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired
};

function List({ notes, remove, currentUserId }) {
  return (
    <div>
      {notes.map(note => (
        <ActivityRow key={note._id}>
          <ActivityWrapper>
            {note.createdUserId === currentUserId ? (
              <DeleteNote>
                <Button
                  btnStyle="danger"
                  size="small"
                  onClick={() => {
                    remove(note._id);
                  }}
                >
                  <Icon icon="trash-a" />
                </Button>
              </DeleteNote>
            ) : null}

            <AvatarWrapper>
              <NameCard.Avatar user={note.createdUser} size={50} />
            </AvatarWrapper>
            <ActivityCaption>
              {note.createdUser.details.fullName}
            </ActivityCaption>
            <div>{moment(note.createdDate).fromNow()}</div>
          </ActivityWrapper>

          <ActivityContent>{note.content}</ActivityContent>
        </ActivityRow>
      ))}
    </div>
  );
}

List.propTypes = propTypes;

export default List;
