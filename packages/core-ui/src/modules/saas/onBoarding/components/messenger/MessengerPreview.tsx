import React from 'react';
import { WidgetPreviewStyled } from 'modules/saas/onBoarding/styles';
import GreetingContent from './GreetingContent';
import TopBar from './TopBar';
import { IUser } from 'modules/auth/types';

type Props = {
  currentUser: IUser;
  color: string;
  avatar: string;
  brandName: string;
};

function MessengerPreview(props: Props) {
  const { currentUser, color, avatar, brandName } = props;

  const renderContent = () => {
    return <GreetingContent color={color} />;
  };

  return (
    <WidgetPreviewStyled>
      <TopBar
        color={color}
        textColor={'#FFFFF'}
        currentUser={currentUser}
        avatar={avatar}
        brandName={brandName}
      />
      {renderContent()}
    </WidgetPreviewStyled>
  );
}

export default MessengerPreview;
