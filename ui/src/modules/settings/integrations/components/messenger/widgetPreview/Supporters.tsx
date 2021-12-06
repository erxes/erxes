import { IUser } from 'modules/auth/types';
import { getUserAvatar } from 'modules/common/utils';
import React from 'react';
import {
  ErxesStaffProfile,
  ErxesSupporters,
  StateSpan,
  Supporters as SupporterStyled
} from './styles';
import { __ } from 'modules/common/utils';

type Props = {
  showChatPreview?: boolean;
  supporterIds?: string[];
  teamMembers: IUser[];
  isOnline: boolean;
  showTimezone?: boolean;
  timezone?: string;
};

class Supporters extends React.Component<Props> {
  renderContent() {
    const { isOnline, teamMembers, supporterIds } = this.props;

    const supporters = teamMembers.filter(user =>
      (supporterIds || []).includes(user._id || '')
    );

    return supporters.map(u => {
      const details = u.details || {};

      return (
        <ErxesStaffProfile key={u._id}>
          <div className="avatar">
            <img src={getUserAvatar(u)} alt={details.fullName} />
            <StateSpan state={isOnline || false} />
          </div>
        </ErxesStaffProfile>
      );
    });
  }

  renderTimezone() {
    const { showTimezone, timezone } = this.props;

    if (!showTimezone) {
      return null;
    }

    return <span>{timezone ? timezone : __('Asia/Ulaanbaatar')}</span>;
  }

  render() {
    const { supporterIds, showChatPreview } = this.props;

    if ((supporterIds || []).length === 0) {
      return null;
    }

    if (showChatPreview) {
      return <SupporterStyled>{this.renderContent()}</SupporterStyled>;
    }

    return (
      <ErxesSupporters>
        {this.renderContent()}
        {this.renderTimezone()}
      </ErxesSupporters>
    );
  }
}

export default Supporters;
