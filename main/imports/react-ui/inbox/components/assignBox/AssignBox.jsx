/* eslint-disable react/jsx-no-bind */

import React, { PropTypes, Component } from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { DropdownToggle } from '/imports/react-ui/common';


const propTypes = {
  ticket: PropTypes.object.isRequired,
  assignees: PropTypes.array.isRequired,
  assign: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  clear: PropTypes.func.isRequired,
  pullRight: PropTypes.bool,
};

class AssignBox extends Component {
  constructor(props) {
    super(props);

    this.clearAssignee = this.clearAssignee.bind(this);
  }

  setAssignee(userId) {
    const { assign, ticket } = this.props;

    assign([ticket._id], userId, error => {
      if (error) {
        Alert.error('Error', error.reason);
      }
    });
  }

  clearAssignee() {
    const { clear, ticket } = this.props;

    clear([ticket._id], error => {
      if (error) {
        Alert.error('Error', error.reason);
      }
    });
  }

  renderUnassign() {
    if (!this.props.ticket.assignedUserId) {
      return null;
    }

    return (
      <MenuItem onClick={this.clearAssignee}>
        Remove Assignees
      </MenuItem>
    );
  }

  renderItems() {
    return this.props.assignees.map((assignee, index) =>
      <MenuItem
        eventKey={index + 1}
        key={assignee._id}
        onClick={this.setAssignee.bind(this, assignee._id)}
      >
        {(assignee.details && assignee.details.fullName) || assignee.emails[0].address}
      </MenuItem>
    );
  }

  render() {
    const { children } = this.props;
    return (
      <Dropdown id="assign-dropdown" className="quick-button" pullRight>
        <DropdownToggle bsRole="toggle">
          {children}
        </DropdownToggle>
        <Dropdown.Menu>
          <MenuItem header>Users</MenuItem>
          {this.renderItems()}
          {this.renderUnassign()}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

AssignBox.propTypes = propTypes;

export default AssignBox;
