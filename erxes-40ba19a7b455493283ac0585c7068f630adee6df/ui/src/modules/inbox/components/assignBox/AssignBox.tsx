import client from 'apolloClient';
import gql from 'graphql-tag';
import debounce from 'lodash/debounce';
import FilterableList from 'modules/common/components/filterableList/FilterableList';
import { __, getUserAvatar } from 'modules/common/utils';
import Alert from 'modules/common/utils/Alert';
import React from 'react';
import { IUser } from '../../../auth/types';
import { queries } from '../../graphql';
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
  assign: (
    doc: { conversationIds?: string[]; assignedUserId: string },
    callback: (error: Error) => void
  ) => void;
  clear: (userIds: string[], callback: (error: Error) => void) => void;
};

type State = {
  assigneesForList: IAssignee[];
  loading: boolean;
};

class AssignBox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      assigneesForList: [],
      loading: true
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = (e?) => {
    const searchValue = e ? e.target.value : '';

    debounce(() => {
      client
        .query({
          query: gql(queries.userList),
          variables: {
            perPage: 20,
            searchValue,
            requireUsername: true
          }
        })
        .then((response: { loading: boolean; data: { users?: IUser[] } }) => {
          const verifiedUsers =
            (response.data.users || []).filter(user => user.username) || [];

          this.setState({
            loading: response.loading,
            assigneesForList: this.generateAssignParams(
              verifiedUsers,
              this.props.targets
            )
          });
        })
        .catch(error => {
          Alert.error(error.message);
        });
    }, 500)();
  };

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
    const { clear, targets, afterSave } = this.props;

    clear(
      targets.map(t => t._id),
      error => {
        if (error) {
          Alert.error(`Error: ${error.message}`);
        }
      }
    );

    if (afterSave) {
      afterSave();
    }
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
      loading: this.state.loading,
      items: this.state.assigneesForList,
      onSearch: this.fetchUsers
    };

    if (event) {
      props[event] = this.assign;
    }

    return <FilterableList {...props} />;
  }
}

export default AssignBox;
