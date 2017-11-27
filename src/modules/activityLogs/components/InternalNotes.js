import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { NameCard } from 'modules/common/components';
import {
  ActivityRow,
  AvatarWrapper,
  ActivityWrapper,
  ActivityCaption,
  ActivityContent
} from 'modules/activityLogs/styles';

const InternalNoteRow = props => {
  const { data } = props;

  return data.list.map(item => {
    if (item.action !== 'internal_note-create') return null;
    return (
      <ActivityRow key={item.id}>
        <ActivityWrapper>
          <AvatarWrapper>
            <NameCard.Avatar user={item.createdUser} size={50} />
          </AvatarWrapper>
          <ActivityCaption>{item.by.details.fullName}</ActivityCaption>
          <div>{moment(item.createdAt).fromNow()}</div>
        </ActivityWrapper>

        <ActivityContent>{item.content}</ActivityContent>
      </ActivityRow>
    );
  });
};

const InternalNotes = props => {
  const { activityLog } = props;

  return activityLog.map((item, index) => (
    <InternalNoteRow key={index} data={item} />
  ));
};

InternalNotes.propTypes = {
  activityLog: PropTypes.array.isRequired
};

export default InternalNotes;
