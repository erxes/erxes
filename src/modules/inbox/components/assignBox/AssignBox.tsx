import { FilterableList } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import Alert from 'modules/common/utils/Alert';
import * as React from 'react';
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
        avatar: assignee.details
          ? assignee.details.avatar
          : '/images/avatar-colored.svg',
        selectedBy: state,
        title: assignee.details ? assignee.details.fullName : assignee.email
      };
    });
  }

  assign(items: IAssignee[], id: string) {
    const { assign, targets, afterSave } = this.props;

    assign(
      {
        assignedUserId: id,
        conversationIds: targets.map(a => a._id)
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
  }

  removeAssignee() {
    const { clear, targets } = this.props;

    clear(targets.map(t => t._id), error => {
      if (error) {
        Alert.error(`Error: ${error.message}`);
      }
    });
  }

  render() {
    const { event, className } = this.props;

    const links = [
      {
        href: '#',
        onClick: this.removeAssignee,
        title: __('Remove assignee')
      }
    ];

    const props = {
      className,
      items: this.state.assigneesForList,
      links,
      selectable: true
    };

    if (event) {
      props[event] = this.assign;
    }

    return <FilterableList {...props} />;
  }
}

export default AssignBox;
