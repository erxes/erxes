import { IUser } from 'modules/auth/types';
import Chip from 'modules/common/components/Chip';
import React from 'react';

type Props = {
  users: IUser[];
  loading: boolean;
  deactivate: (userId: string) => void;
};

class UserList extends React.PureComponent<Props, {}> {
  renderItems = () => {
    const { users, deactivate } = this.props;

    return users.map(user => (
      <Chip key={user._id} onClick={deactivate.bind(null, user._id)}>
        {user.username || user.email}
      </Chip>
    ));
  };

  render() {
    return <div>{this.renderItems()}</div>;
  }
}

export default UserList;
