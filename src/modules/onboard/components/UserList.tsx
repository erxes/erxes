import { IUser } from 'modules/auth/types';
import { Chip } from 'modules/common/components';
import * as React from 'react';

type Props = {
  users: IUser[];
  loading: boolean;
  remove: (userId: string) => void;
};

class UserList extends React.PureComponent<Props, {}> {
  renderItems = () => {
    const { users, remove } = this.props;

    return users.map(user => (
      <Chip key={user._id} onClick={remove.bind(null, user._id)}>
        {user.username || user.email}
      </Chip>
    ));
  };

  render() {
    return <div>{this.renderItems()}</div>;
  }
}

export default UserList;
