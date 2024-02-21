import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { __ } from 'modules/common/utils';
import { ErxesMiddleTitle, ErxesTopbar } from 'modules/saas/onBoarding/styles';

type Props = {
  color: string;
  textColor: string;
  message?: string;
  logoPreviewUrl?: string;
  currentUser: IUser;
};

class TopBar extends React.Component<Props> {
  renderTopBar() {
    return (
      <>
        <ErxesMiddleTitle>
          <h3>General Information</h3>
        </ErxesMiddleTitle>
      </>
    );
  }

  renderContent() {
    return this.renderTopBar();
  }

  render() {
    const { color, textColor } = this.props;

    return (
      <ErxesTopbar style={{ backgroundColor: color, color: textColor }}>
        {this.renderContent()}
      </ErxesTopbar>
    );
  }
}

export default TopBar;
