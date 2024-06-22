import React from 'react';
import { LeftSidebar, SidebarHeader } from 'modules/saas/onBoarding/styles';
import Indicator from './Indicator';
import Messenger from '../container/messenger/Messenger';
import Welcome from './welcome/Welcome';
import MessengerScript from './messengerScript/MessengerScript';
import ProfileSetup from '../container/profile/ProfileSetup';
import { IUser } from '@erxes/ui/src/auth/types';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import OnBoardingDone from '../container/OnBoardingDone';

type Props = {
  activeStep: number;
  totalStep: number;
  currentUser: IUser;
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  setEmail: (name: string) => void;
  avatar: string;
  setAvatar: (name: string) => void;
  brandName: string;
  setBrandName: (name: string) => void;
  color: string;
  setColor: (color: string) => void;
  integration: IIntegration;
  onboardingSteps: any[];
};

const Sidebar = (props: Props) => {
  const {
    activeStep,
    totalStep,
    currentUser,
    integration,
    onboardingSteps,
    firstName,
    lastName,
    email,
    setFirstName,
    setLastName,
    setEmail,
    avatar,
    setAvatar,
    brandName,
    setBrandName,
    color,
    setColor,
  } = props;

  const renderContent = () => {
    const profileProps = {
      firstName,
      lastName,
      email,
      setFirstName,
      setLastName,
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

    if (activeStep === 0) {
      return <Welcome />;
    }

    if (activeStep === totalStep) {
      return <OnBoardingDone />;
    }

    return (onboardingSteps || []).map((step) => {
      if (step === 'setupProfile') {
        if (activeStep === 1) {
          return (
            <ProfileSetup
              currentUser={currentUser}
              {...profileProps}
            />
          );
        }
      }

      if (step === 'installMessenger') {
        if (activeStep === 2) {
          return (
            <Messenger
              {...messengerProps}
              integration={integration}
            />
          );
        }

        if (activeStep === 3) {
          return <MessengerScript integration={integration} />;
        }
      }
    });
  };

  const renderHeaderInfo = () => {
    if (activeStep === 0) {
      return null;
    }

    if (activeStep === totalStep) {
      return (
        <>
          <h2>Successfull 🎉</h2>
          <p>
            Congratulations on successfully creating your organization! Welcome
            to our platform. We are excited to have you on board and look
            forward to supporting you on your journey.
            <br />
            <br />
            Enjoy your time with us!
          </p>
        </>
      );
    }

    return (onboardingSteps || []).map((step) => {
      if (step === 'setupProfile') {
        if (activeStep === 1) {
          return (
            <>
              <h2>Profile Setup</h2>
              <p>Fill out the form below to start your account setup.</p>
            </>
          );
        }
      }

      if (step === 'installMessenger') {
        if (activeStep === 2) {
          return (
            <>
              <h2>Customize messenger</h2>
              <p>
                Integrating erxes messenger into your website enables seamless
                real-time communication with customers. Personalize your
                messenger to align perfectly with your branding.
              </p>
            </>
          );
        }

        if (activeStep === 3) {
          return (
            <>
              <h2>
                Connect customer source <br /> to access your org
              </h2>
              <p>
                The reference customer source will be the unique source that
                automatically creates your contacts and accounts records in
                erxes. Then you will be able to connect additional integrations
                to add more data to your customers like support tickets, task,
                CRM and more.
              </p>
            </>
          );
        }
      }
    });
  };

  return (
    <LeftSidebar showStar={activeStep === 0 || false}>
      {activeStep === 0 && (
        <img src="/images/shootingStars.png" className="welcome-cover" />
      )}
      {activeStep !== 0 && (
        <SidebarHeader>
          <div className="header">{renderHeaderInfo()}</div>
          <Indicator totalStep={totalStep} activeStep={activeStep} />
        </SidebarHeader>
      )}
      {renderContent()}
    </LeftSidebar>
  );
};

export default Sidebar;
