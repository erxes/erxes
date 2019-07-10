import FilterableList from 'modules/common/components/filterableList/FilterableList';
import { __, getUserAvatar } from 'modules/common/utils';
import Alert from 'modules/common/utils/Alert';
import React from 'react';
import { IUser } from '../../../auth/types';
import { IConversation } from '../../types';

interface IAssignee {
  _id: string;
  title?: string;
  avatar?: string;
  selectedBy: string;
}

type Props = {
  targets: IConversation[];
  event?: string;
  className?: string;
  afterSave?: () => void;
  // from containers
  assignees: IUser[];
  assign: (
    doc: { conversationIds?: string[]; assignedUserId: string },
    callback: (error: Error) => void
  ) => void;
  clear: (userIds: string[], callback: (error: Error) => void) => void;
};

type State = {
  assigneesForList?: IAssignee[];
};

class AssignBox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      assigneesForList: this.generateAssignParams(
        props.assignees,
        props.targets
      )
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      assigneesForList: this.generateAssignParams(
        nextProps.assignees,
        nextProps.targets
      )
    });
  }

  generateAssignParams(assignees: IUser[] = [], targets: IConversation[] = []) {
    return assignees.map(assignee => {
      const count = targets.reduce((memo, target) => {
        let index = 0;

        if (
          target.assignedUserId &&
          target.assignedUserId.indexOf(assignee._id) > -1
        ) {
          index += 1;
        }

        return memo + index;
      }, 0);

      let state = 'none';
      if (count === targets.length) {
        state = 'all';
      } else if (count < targets.length && count > 0) {
        state = 'some';
      }

      return {
        _id: assignee._id,
        title:
          (assignee.details && assignee.details.fullName) || assignee.email,
        avatar: getUserAvatar(assignee),
        selectedBy: state
      };
    });
  }

  assign = (items: IAssignee[], id: string) => {
    const { assign, targets, afterSave } = this.props;

    assign(
      {
        conversationIds: targets.map(a => a._id),
        assignedUserId: id
      },
      error => {
        if (error) {
          Alert.error(error.message);
        }
      }
    );

    if (afterSave) {
      afterSave();
    }
  };

  removeAssignee = () => {
    const { clear, targets } = this.props;

    clear(targets.map(t => t._id), error => {
      if (error) {
        Alert.error(`Error: ${error.message}`);
      }
    });
  };

  render() {
    const { event, className } = this.props;

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
      items: this.state.assigneesForList
    };

    if (event) {
      props[event] = this.assign;
    }

    return <FilterableList {...props} />;
  }
}

export default AssignBox;
