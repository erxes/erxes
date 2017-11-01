import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NameCard, Icon } from 'modules/common/components';
import Form from './Form';

const propTypes = {
  notes: PropTypes.array.isRequired,
  currentUserId: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired,
  create: PropTypes.func.isRequired
};

function List({ notes, remove, create, currentUserId }) {
  return (
    <div>
      <Form create={create} />

      <div className="internal-notes-list">
        {notes.map(note => (
          <div key={note._id} className="item">
            <div className="topbar">
              <NameCard user={note.createdUser} avatarSize={50} />
              <div className="date">{moment(note.createdDate).fromNow()}</div>
              <div className="clearfix" />
            </div>
            <div className="text">{note.content}</div>

            {note.createdUserId === currentUserId ? (
              <Icon
                icon="delete trash-a"
                role="button"
                onClick={() => {
                  remove(note._id);
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

List.propTypes = propTypes;

export default List;
