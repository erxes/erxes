import * as React from 'react';
import { defaultAvatar } from '../../icons/Icons';
import { IUser } from '../types';

function User({ user }: { user?: IUser }) {
  const avatar = user && user.details && user.details.avatar;

  return (
    <div className="erxes-avatar">
      <img src={avatar || defaultAvatar} alt="avatar" />
    </div>
  );
}

export default User;
