import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Alert from 'modules/common/utils/Alert';
import { FilterableList } from 'modules/common/components';

const propTypes = {
  targets: PropTypes.array,
  event: PropTypes.oneOf(['onClick', 'onExit']),
  className: PropTypes.string,
  afterSave: PropTypes.func,
  //from containers
  assignees: PropTypes.array,
  assign: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
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
      const count = targets.reduce(
        (memo, target) =>
          memo +
          (target.assignedUserId &&
            target.assignedUserId.indexOf(assignee._id) > -1),
        0
      );

      let state = 'none';
      if (count === targets.length) {
        state = 'all';
      } else if (count < targets.length && count > 0) {
        state = 'some';
      }

      return {
        _id: assignee._id,
        title: assignee.details.fullName || assignee.email,
        avatar: assignee.details.avatar || '/images/avatar-colored.svg',
        selectedBy: state
      };
    });
  }

  assign(assignees, id) {
    const { assign, targets, afterSave } = this.props;

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

    if (afterSave) {
      afterSave();
    }
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
    const { __ } = this.context;

    const links = [
      {
        title: __('Remove assignee'),
        href: '#',
        onClick: this.removeAssignee
      }
    ];

    const props = {
      className,
      links,
      selectable: true,
      items: this.state.assigneesForList,
      [event]: this.assign
    };

    return <FilterableList {...props} />;
  }
}

AssignBox.propTypes = propTypes;
AssignBox.contextTypes = contextTypes;

export default AssignBox;
