import { currentUserState, useVersion } from 'ui-modules';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useMemo } from 'react';

import { AppPath } from '@/types/paths/AppPath';
import { FinalSection } from '@/onboarding/components/FinalSection';
import { InviteTeamMemberSection } from '@/onboarding/components/InviteTeamMemberSection';
import { LoadingScreen } from '@/auth/components/LoadingScreen';
import { OnboardingLeftSideBar } from '@/onboarding/components/OnboardingLeftSideBar';
import { OnboardingStepper } from '@/onboarding/components/OnboardingStepper';
import { ProfileSection } from '@/onboarding/components/ProfileSection';
import { ThemeSection } from '@/onboarding/components/ThemeSection';
import { WelcomeSection } from '@/onboarding/components/WelcomeSection';
import { getOnboardingSteps } from '@/onboarding/components/onboardingSteps';
import { motion } from 'framer-motion';
import { onboardingStepState } from '@/onboarding/state/onboardingStepState';
import { useNavigate } from 'react-router-dom';
import { usePreviousHotkeyScope } from 'erxes-ui';
import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';

export const MainOnboarding = () => {
  const { usersEdit } = useUserEdit();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useAtom(onboardingStepState);
  const currentUser = useAtomValue(currentUserState);
  const isOwner = currentUser?.isOwner;
  const steps = useMemo(() => getOnboardingSteps(isOwner), [isOwner]);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope('welcome');
  }, [setHotkeyScopeAndMemorizePreviousScope]);
  const isSaas = useVersion('saas');
  useEffect(() => {
    if (currentUser?.isOnboarded) {
      navigate(!isSaas ? AppPath.WelcomeHome : AppPath.Index, {
        replace: true,
      });
    }
  }, [currentUser, navigate, isSaas]);
  useEffect(() => {
    if (currentStep < 1 || currentStep > steps.length) {
      setCurrentStep(1);
    }
  }, [currentStep, steps.length, setCurrentStep]);
  if (!currentUser) {
    return <LoadingScreen />;
  }
  return (
    <div className="flex h-screen w-full flex-col lg:flex-row">
      <OnboardingLeftSideBar
        steps={steps}
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
      />

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-4 px-6 py-10 lg:w-1/2 lg:py-0">
        <div className="absolute left-6 right-6 top-6 flex items-center gap-3 lg:left-10 lg:right-10 lg:top-8">
          <motion.span
            key={currentStep}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-semibold uppercase tracking-wider text-primary"
          >
            Step {currentStep} of {steps.length}
          </motion.span>
          <span className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
        </div>
        <div className="flex w-5/6 flex-col items-center justify-center gap-4 lg:w-4/6">
          {currentStep === 1 && (
            <WelcomeSection
              steps={steps}
              onContinue={() => {
                setCurrentStep(2);
              }}
            />
          )}

          {currentStep === 2 && (
            <ProfileSection onContinue={() => setCurrentStep(3)} />
          )}

          {currentStep === 3 && (
            <ThemeSection onContinue={() => setCurrentStep(currentStep + 1)} />
          )}

          {isOwner && currentStep === 4 && (
            <InviteTeamMemberSection
              onContinue={() => setCurrentStep(currentStep + 1)}
            />
          )}

          {currentStep === (isOwner ? 5 : 4) && (
            <FinalSection
              onContinue={() => {
                usersEdit({
                  variables: {
                    _id: currentUser._id,
                    isOnboarded: true,
                  },
                });
                setCurrentStep(1);
              }}
            />
          )}
        </div>
      </div>

      {currentStep > 1 && (
        <div className="flex items-center justify-center gap-2 absolute bottom-6 lg:hidden">
          <OnboardingStepper
            stepCount={steps.length}
            currentStep={currentStep}
            setCurrentStep={(index) => {
              const target = steps[index - 1];
              if (target && index <= currentStep) {
                setCurrentStep(target.step);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
