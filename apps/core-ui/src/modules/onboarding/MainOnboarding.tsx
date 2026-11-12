import { usePreviousHotkeyScope } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCan, useSession } from '~/modules/auth/session';
import { SetupScreen } from './components/SetupScreen';
import { useNeedsOnboarding } from './OnboardingGuard';
import { FinalSection } from './components/FinalSection';
import { InviteTeamMemberSection } from './components/InviteTeamMemberSection';
import { OnboardingLeftSideBar } from './components/OnboardingLeftSideBar';
import { OnboardingStepper } from './components/OnboardingStepper';
import { ProfileSection } from './components/ProfileSection';
import { ThemeSection } from './components/ThemeSection';
import { WelcomeSection } from './components/WelcomeSection';
import { appearStyle } from './components/Appear';
import { getOnboardingSteps } from './components/onboardingSteps';
import { onboardingStepState } from './state/onboardingState';

export const MainOnboarding = () => {
  const navigate = useNavigate();
  const needsOnboarding = useNeedsOnboarding();
  const { user } = useSession();
  // The owner (who opens a fresh organisation) is offered example data.
  const isOwner = user.role === 'owner';
  const [exampleData, setExampleData] = useState(isOwner);
  // After the last step: "Setting up …" while it is saved (on the member, so
  // other browsers skip the steps too) and the example data is seeded.
  const [settingUp, setSettingUp] = useState(false);
  const [currentStep, setCurrentStep] = useAtom(onboardingStepState);
  // Old erxes offered invites to owners; in the new core admins may invite too
  const canInvite = useCan()('team.invite');
  const steps = useMemo(() => getOnboardingSteps(canInvite), [canInvite]);
  const { setHotkeyScopeAndMemorizePreviousScope, goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope('welcome');

    return () => goBackToPreviousHotkeyScope();
  }, [setHotkeyScopeAndMemorizePreviousScope, goBackToPreviousHotkeyScope]);

  useEffect(() => {
    if (!needsOnboarding) {
      navigate('/', { replace: true });
    }
  }, [needsOnboarding, navigate]);

  useEffect(() => {
    if (currentStep < 1 || currentStep > steps.length) {
      setCurrentStep(1);
    }
  }, [currentStep, steps.length, setCurrentStep]);

  if (settingUp) {
    return (
      <SetupScreen
        exampleData={isOwner && exampleData}
        onDone={() => {
          setCurrentStep(1);
          navigate('/', { replace: true });
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full flex-col lg:flex-row">
      <OnboardingLeftSideBar steps={steps} currentStep={currentStep} onSelectStep={setCurrentStep} />

      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-4 px-6 py-10 lg:w-1/2 lg:py-0">
        <div className="absolute left-6 right-6 top-6 flex items-center gap-3 lg:left-10 lg:right-10 lg:top-8">
          <span
            key={currentStep}
            className="text-xs font-semibold uppercase tracking-wider text-primary animate-in"
            style={appearStyle({ y: -6, duration: 300 })}
          >
            Step {currentStep} of {steps.length}
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
        </div>
        <div className="flex w-5/6 flex-col items-center justify-center gap-4 lg:w-4/6">
          {currentStep === 1 && <WelcomeSection steps={steps} onContinue={() => setCurrentStep(2)} />}

          {currentStep === 2 && <ProfileSection onContinue={() => setCurrentStep(3)} />}

          {currentStep === 3 && <ThemeSection onContinue={() => setCurrentStep(currentStep + 1)} />}

          {canInvite && currentStep === 4 && (
            <InviteTeamMemberSection onContinue={() => setCurrentStep(currentStep + 1)} />
          )}

          {currentStep === (canInvite ? 5 : 4) && (
            <FinalSection
              exampleData={isOwner ? { value: exampleData, onChange: setExampleData } : undefined}
              onContinue={() => setSettingUp(true)}
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
