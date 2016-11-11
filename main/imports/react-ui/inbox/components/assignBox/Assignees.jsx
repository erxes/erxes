import React, { PropTypes } from 'react';

const propTypes = {
  ticket: PropTypes.object.isRequired,
};

function Assignees({ ticket }) {
  const assignedUser = ticket.assignedUser();
  const assignedUserName = assignedUser && assignedUser.details && assignedUser.details.fullName ?
                `Assigned to ${assignedUser.details.fullName}` : 'Not assigned';

  return (
    <span className="assignee">
      <i className="ion-person" /> {assignedUserName}
    </span>
  );
}

Assignees.propTypes = propTypes;

export default Assignees;
