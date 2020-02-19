import * as React from 'react';
import { defaultAvatar } from '../../../icons/Icons';
import { IUser } from '../../../types';
import { readFile } from '../../../utils';

function User({ user }: { user?: IUser }) {
  const avatar = user && user.details && user.details.avatar;

  return (
    <div className="erxes-avatar">
      <img src={readFile(avatar || defaultAvatar)} alt="avatar" />
    </div>
  );
}

export default User;
