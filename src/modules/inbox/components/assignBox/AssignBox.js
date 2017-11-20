/* eslint-disable react/jsx-no-bind */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Alert from 'modules/common/utils/Alert';
import { FilterableList } from 'modules/common/components';

const propTypes = {
  targets: PropTypes.array,
  event: PropTypes.oneOf(['onClick', 'onExit']),
  className: PropTypes.string,
  hidePopover: PropTypes.func,
  //from containers
  assignees: PropTypes.array,
  assign: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired
};

class AssignBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      assigneesForList: this.generateAssignParams(
        props.assignees,
        props.targets
      )
    };

    this.removeAssignee = this.removeAssignee.bind(this);
    this.assign = this.assign.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      assigneesForList: this.generateAssignParams(
        nextProps.assignees,
        nextProps.targets
      )
    });
  }

  generateAssignParams(assignees = [], targets = []) {
    return assignees.map(assignee => {
      // Current tag's selection state (all, some or none)
      const count = targets.reduce(
        (memo, target) =>
          memo +
          (target.assignedUserId &&
            target.assignedUserId.indexOf(assignee._id) > -1),
        0
      );

      let state = 'none';
      if (count > 0) {
        if (count === targets.length) {
          state = 'all';
        } else if (count < targets.length) {
          state = 'some';
        }
      }

      return {
        _id: assignee._id,
        title: assignee.details.fullName || assignee.emails[0].address,
        avatar: assignee.details.avatar,
        selectedBy: state
      };
    });
  }

  assign(assignees, id) {
    const { assign, targets, hidePopover } = this.props;
    const { assigneesForList } = this.state;
    const unchanged = assigneesForList.reduce(
      (prev, current, index) =>
        prev && current.selectedBy === assignees[index].selectedBy,
      true
    );
    if (unchanged) {
      return;
    }

    assign(
      {
        conversationIds: targets.map(t => t._id),
        assignedUserId: id
      },
      error => {
        if (error) {
          Alert.error(error.reason);
        }
      }
    );
    hidePopover();
  }

  removeAssignee() {
    const { clear, targets } = this.props;
    clear(targets.map(t => t._id), error => {
      if (error) {
        Alert.error('Error', error.reason);
      }
    });
  }

  render() {
    const { event, className } = this.props;

    const links = [
      {
        title: 'Remove assignee',
        href: '#',
        onClick: this.removeAssignee
      }
    ];

    const props = {
      className,
      links,
      showCheckmark: false,
      items: this.state.assigneesForList,
      [event]: this.assign
    };

    return <FilterableList {...props} />;
  }
}

AssignBox.propTypes = propTypes;

export default AssignBox;
