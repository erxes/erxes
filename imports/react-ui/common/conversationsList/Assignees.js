import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  conversation: PropTypes.object.isRequired,
};

function Assignees({ conversation }) {
  const assignedUser = conversation.assignedUser();
  const assignedUserName = assignedUser && assignedUser.details && assignedUser.details.fullName
    ? `Assigned to ${assignedUser.details.fullName}`
    : 'Not assigned';

  return (
    <span className="assignee">
      <i className="ion-person" /> {assignedUserName}
    </span>
  );
}

Assignees.propTypes = propTypes;

export default Assignees;
