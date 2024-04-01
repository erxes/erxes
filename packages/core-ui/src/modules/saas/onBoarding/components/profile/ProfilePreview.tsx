import React from 'react';
import { WidgetPreviewStyled } from 'modules/saas/onBoarding/styles';
import TopBar from './TopBar';
import { IUser } from 'modules/auth/types';
import GeneralInformation from './GeneralInformation';

type Props = {
  currentUser: IUser;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
};

function MessengerPreview(props: Props) {
  const { currentUser, firstName, lastName, email, avatar } = props;

  const renderContent = () => {
    return (
      <GeneralInformation
        firstName={firstName}
        lastName={lastName}
        email={email}
        avatar={avatar}
      />
    );
  };

  return (
    <WidgetPreviewStyled>
      <TopBar
        color={'#4F33AF'}
        textColor={'#FFFFF'}
        currentUser={currentUser}
      />
      {renderContent()}
    </WidgetPreviewStyled>
  );
}

export default MessengerPreview;
