import { Alert, __, getUserAvatar } from 'coreui/utils';

import FilterableList from '@erxes/ui/src/components/filterableList/FilterableList';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import client from '@erxes/ui/src/apolloClient';
import debounce from 'lodash/debounce';
import { gql } from '@apollo/client';
import { queries } from '@erxes/ui-inbox/src/inbox/graphql';

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
  keysPressed: any;
  cursor: number;
  verifiedUsers: any[];
};

class AssignBox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      assigneesForList: [],
      verifiedUsers: [],
      loading: true,
      keysPressed: {},
      cursor: 0
    };
  }

  componentDidMount() {
    this.fetchUsers();
    document.addEventListener('keydown', this.handleArrowSelection);
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>
  ): void {
    if (prevState.cursor !== this.state.cursor) {
      this.setState({
        assigneesForList: this.generateAssignParams(
          this.state.verifiedUsers,
          this.props.targets
        )
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleArrowSelection);
  }

  handleArrowSelection = (event: any) => {
    const { cursor } = this.state;

    const maxCursor: number = this.state.assigneesForList.length;

    const element = document.getElementsByClassName(
      'team-members-' + cursor
    )[0] as HTMLElement;

    switch (event.keyCode) {
      case 13:
        if (element) {
          element.click();
        }
        break;
      case 38:
        // Arrow move up
        if (cursor > 0) {
          this.setState({ cursor: cursor - 1 }, () => element.focus());
        }
        if (cursor === 0) {
          this.setState({ cursor: maxCursor - 1 }, () => element.focus());
        }
        break;
      case 40:
        // Arrow move down
        if (cursor < maxCursor - 1) {
          this.setState({ cursor: cursor + 1 }, () => element.focus());
        } else {
          this.setState({ cursor: 0 });
        }
        break;
      default:
        break;
    }
  };

  fetchUsers = (e?) => {
    const searchValue = e ? e.target.value : '';

    debounce(() => {
      client
        .query({
          query: gql(queries.userList),
          variables: {
            perPage: 20,
            searchValue
          }
        })
        .then((response: { loading: boolean; data: { users?: IUser[] } }) => {
          this.setState({ verifiedUsers: response.data.users || [] });

          this.setState({
            loading: response.loading,
            assigneesForList: this.generateAssignParams(
              this.state.verifiedUsers,
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
    return assignees.map((assignee, i) => {
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
        avatar: getUserAvatar(assignee, 60),
        selectedBy: state,
        itemClassName: `team-members-${i}`,
        itemActiveClass: this.state.cursor === i && 'active'
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
        href: window.location.pathname + window.location.search,
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
