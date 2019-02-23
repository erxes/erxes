import { IUser } from 'modules/auth/types';
import * as React from 'react';
import {
  ErxesStaffProfile,
  ErxesSupporters,
  StateSpan,
  Supporters as SupporterStyled
} from './styles';

type Props = {
  isGreeting?: boolean;
  supporterIds?: string[];
  teamMembers: IUser[];
  isOnline: boolean;
};

class Supporters extends React.Component<Props> {
  renderContent() {
    const { isOnline, teamMembers, supporterIds } = this.props;

    const supporters = teamMembers.filter(user =>
      (supporterIds || []).includes(user._id || '')
    );

    return supporters.map(u => {
      const details = u.details || {};
      let avatar = details.avatar;

      if (!details.avatar) {
        avatar = '/images/avatar-colored.svg';
      }

      return (
        <ErxesStaffProfile key={u._id}>
          <img src={avatar} alt={details.fullName} />
          <StateSpan state={isOnline || false} />
        </ErxesStaffProfile>
      );
    });
  }

  render() {
    const { supporterIds, isGreeting } = this.props;

    if ((supporterIds || []).length === 0) {
      return null;
    }

    if (isGreeting) {
      return <SupporterStyled>{this.renderContent()}</SupporterStyled>;
    }

    return <ErxesSupporters>{this.renderContent()}</ErxesSupporters>;
  }
}

export default Supporters;
