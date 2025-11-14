import { WelcomeSection } from '@/onboarding/components/WelcomeSection';
import { UserCredentialSection } from '@/onboarding/components/UserCredentialSection';
import { ThemeSection } from '@/onboarding/components/ThemeSection';
import { FinalSection } from '@/onboarding/components/FinalSection';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserMoreInfoForm } from '@/onboarding/components/UserMoreInfoSection';
import { useVersion } from 'ui-modules';
import { InviteTeamMemberSection } from '@/onboarding/components/InviteTeamMemberSection';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { usePreviousHotkeyScope } from 'erxes-ui';
import { OnboardingStepper } from '@/onboarding/components/OnboardingStepper';
import { atom, useSetAtom } from 'jotai';
import { AppPath } from '@/types/paths/AppPath';
import { LoadingScreen } from '@/auth/components/LoadingScreen';

const onboardingEnded = atom(false);
export const MainOnboarding = () => {
  const setOnboardingEnded = useSetAtom(onboardingEnded);
  const isSaas = !useVersion();
  let stepCount = isSaas ? 4 : 5;

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const currentUser = useAtomValue(currentUserState);
  const isOwner = currentUser?.isOwner;
  stepCount = stepCount + (isOwner ? 1 : 0);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope('welcome');
  }, [setHotkeyScopeAndMemorizePreviousScope]);
  useEffect(() => {
    if (currentUser?.username && onboardingEnded) {
      navigate(AppPath.Index, { replace: true });
    }
  }, [currentUser?.username, navigate]);
  if (!currentUser?.username) {
    return <LoadingScreen />;
  }
  return (
    <>
      {currentStep === 1 && (
        <WelcomeSection onContinue={() => setCurrentStep(2)} />
      )}

      {!isSaas && currentStep === 2 && (
        <UserCredentialSection onContinue={() => setCurrentStep(3)} />
      )}

      {currentStep === (isSaas ? 2 : 3) && (
        <ThemeSection onContinue={() => setCurrentStep(currentStep + 1)} />
      )}

      {currentStep === (isSaas ? 3 : 4) && (
        <UserMoreInfoForm onContinue={() => setCurrentStep(currentStep + 1)} />
      )}

      {currentStep === (isSaas ? 4 : 5) + (isOwner ? 0 : 1) && (
        <>
          {isOwner && (
            <InviteTeamMemberSection
              onContinue={() => setCurrentStep(currentStep + 1)}
            />
          )}
        </>
      )}
      {currentStep === (isSaas ? 4 : 5) + (isOwner ? 1 : 0) && (
        <FinalSection
          onContinue={() => {
            navigate(AppPath.Index);
            setOnboardingEnded(true);
          }}
        />
      )}

      <div className="flex items-center justify-center gap-2 absolute bottom-6">
        <OnboardingStepper
          stepCount={stepCount}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      </div>
    </>
  );
};
