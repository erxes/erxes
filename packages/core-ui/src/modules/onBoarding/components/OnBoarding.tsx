import React, { useState, useEffect } from 'react';
import {
  Content,
  MainContent,
  SuccessContent,
} from 'modules/onBoarding/styles';
import WelcomeContent from './welcome/WelcomeContent';
import Sidebar from './Sidebar';
import MessengerPreview from './messenger/MessengerPreview';
import { IUser } from 'modules/auth/types';
import InstallCode from '../container/messenger/InstallCode';
import ProfilePreview from './profile/ProfilePreview';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';

type Props = {
  currentUser: IUser;
  onboardingSteps: any[];
  user: IUser;
  integration: IIntegration;
  queryParams: any;
  history: any;
};

const OnBoarding = ({
  currentUser,
  onboardingSteps,
  user,
  integration,
  queryParams,
  history,
}: Props) => {
  const [activeStep, changeStep] = useState<number>(queryParams.steps || 0);
  const [firstName, setFirstName] = useState(user?.details?.firstName || '');
  const [lastName, setLastName] = useState(user?.details?.lastName || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatar, setAvatar] = useState(user?.details?.avatar || '');

  const [brandName, setBrandName] = useState(integration?.brand?.name || '');
  const [color, setColor] = useState(
    integration?.uiOptions?.color || '#4F33AF',
  );

  useEffect(() => {
    if (queryParams.steps) {
      changeStep(Number(queryParams.steps));
    }
  }, [queryParams]);

  let totalSteps = onboardingSteps.length + 1;

  if (onboardingSteps.includes('installMessenger')) {
    totalSteps = totalSteps + 1;
  }

  if (onboardingSteps.includes('clientPortal')) {
    totalSteps = totalSteps - 1;
  }

  const flexStart =
    (activeStep === 3 && onboardingSteps.includes('installMessenger')) ||
    activeStep === totalSteps
      ? true
      : false;

  const profileProps = {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    avatar,
    setAvatar,
  };

  const messengerProps = {
    brandName,
    setBrandName,
    color,
    setColor,
  };

  const renderMainContent = () => {
    if (activeStep === 0) {
      return <WelcomeContent />;
    }

    if (activeStep === totalSteps) {
      return (
        <SuccessContent>
          <img src="/images/onboarding/success.png" />
        </SuccessContent>
      );
    }

    return (onboardingSteps || []).map((step) => {
      if (step === 'setupProfile') {
        if (activeStep === 1) {
          return (
            <ProfilePreview
              currentUser={currentUser}
              firstName={firstName}
              lastName={lastName}
              email={email}
              avatar={avatar}
            />
          );
        }
      }

      if (step === 'installMessenger') {
        if (activeStep === 2) {
          return (
            <MessengerPreview
              currentUser={currentUser}
              color={color}
              avatar={avatar}
              brandName={brandName}
            />
          );
        }
        if (step === 'installMessenger') {
          if (activeStep === 3) {
            return <InstallCode />;
          }
        }
      }
    });
  };

  return (
    <Content>
      <Sidebar
        activeStep={activeStep}
        totalStep={totalSteps}
        currentUser={currentUser}
        integration={integration}
        onboardingSteps={onboardingSteps}
        history={history}
        {...profileProps}
        {...messengerProps}
      />
      <MainContent
        full={activeStep === totalSteps ? true : false}
        flexStart={flexStart}
      >
        {renderMainContent()}
      </MainContent>
    </Content>
  );
};

export default OnBoarding;
