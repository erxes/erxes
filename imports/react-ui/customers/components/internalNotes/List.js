import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';

const propTypes = {
  internalNotes: PropTypes.array.isRequired,
  removeInternalNote: PropTypes.func.isRequired,
};

function List({ internalNotes, removeInternalNote }) {
  return (
    <ul className="customers-internal-notes-list">
      {internalNotes.map(note => (
        <li key={note._id}>
          <div className="note">{note.content}</div>
          <div className="meta">
            <div className="pull-left">
              <span className="who">
                {Meteor.users.findOne(note.createdBy).details.fullName} /{' '}
              </span>
              {' '}
              <span className="when">{moment(note.createdDate).fromNow()}</span>
            </div>
            <div className="pull-right">
              {note.createdBy === Meteor.userId()
                ? <i
                    className="delete ion-trash-a"
                    role="button"
                    onClick={() => {
                      if (confirm('Are you sure to delete this note?')) {
                        removeInternalNote(note._id);
                      }
                    }}
                  />
                : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

List.propTypes = propTypes;

export default List;
