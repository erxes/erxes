import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { __, readFile } from 'modules/common/utils';
import {
  ErxesStaffProfile,
  StateSpan,
  ErxesSupporters,
} from 'modules/saas/onBoarding/styles';

type Props = {
  currentUser: IUser;
  isOnline: boolean;
  avatar: string;
};

class Supporters extends React.Component<Props> {
  getUserAvatar = (avatarUrl) => {
    const { avatar } = this.props;

    if (!avatar) {
      return '/images/avatar-colored.svg';
    }

    return readFile(avatarUrl);
  };

  renderContent() {
    const { isOnline, currentUser, avatar } = this.props;

    return (
      <ErxesStaffProfile>
        <div className="avatar">
          <img
            src={this.getUserAvatar(avatar)}
            alt={currentUser?.details?.fullName || ''}
          />
          <StateSpan state={isOnline || false} />
        </div>
      </ErxesStaffProfile>
    );
  }

  render() {
    return <ErxesSupporters>{this.renderContent()}</ErxesSupporters>;
  }
}

export default Supporters;
