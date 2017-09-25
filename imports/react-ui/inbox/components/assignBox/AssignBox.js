/* eslint-disable react/jsx-no-bind */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Alert from 'meteor/erxes-notifier';
import { FilterableList } from '/imports/react-ui/common';

const propTypes = {
  targets: PropTypes.array.isRequired,
  assignees: PropTypes.array.isRequired,
  assign: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired,
  event: PropTypes.oneOf(['onClick', 'onExit']),
  className: PropTypes.string,
};

class AssignBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      assingeesForList: this.generateAssignParams(props.assignees, props.targets),
    };

    this.removeAssignee = this.removeAssignee.bind(this);
    this.assign = this.assign.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      assingeesForList: this.generateAssignParams(nextProps.assignees, nextProps.targets),
    });
  }

  assign(items, id) {
    const { assign, targets } = this.props;

    assign(
      {
        targetIds: targets.map(t => t._id),
        assignedUserId: id,
      },
      error => {
        if (error) {
          Alert.error(error.reason);
        }
        return Alert.success('The conversation Assignee has been renewed.');
      },
    );
  }

  generateAssignParams(assignees, targets) {
    return assignees.map(assignee => {
      // Current tag's selection state (all, some or none)
      const count = targets.reduce(
        (memo, target) =>
          memo + (target.assignedUserId && target.assignedUserId.indexOf(assignee._id) > -1),
        0,
      );

      let state = 'none';

      if (count === targets.length) {
        state = 'all';
      } else if (count < targets.length && count > 0) {
        state = 'some';
      }

      return {
        _id: assignee._id,
        title: assignee.details.fullName || assignee.emails[0].address,
        selectedBy: state,
      };
    });
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
        onClick: this.removeAssignee,
      },
    ];

    const props = {
      className,
      links,
      items: this.state.assingeesForList,
      [event]: this.assign,
    };

    return <FilterableList {...props} />;
  }
}

AssignBox.propTypes = propTypes;

export default AssignBox;
