import { paths } from '~/lib/paths';
import { usePreviousHotkeyScope } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCan, useSession } from '~/modules/auth/session';
import { Appear } from './components/Appear';
import { FinalSection } from './components/FinalSection';
import { InviteTeamMemberSection } from './components/InviteTeamMemberSection';
import { OnboardingLeftSideBar } from './components/OnboardingLeftSideBar';
import { OnboardingStepper } from './components/OnboardingStepper';
import { getOnboardingSteps, type OnboardingStepDef } from './components/onboardingSteps';
import { ProfileSection } from './components/ProfileSection';
import { SetupScreen } from './components/SetupScreen';
import { ThemeSection } from './components/ThemeSection';
import { WelcomeSection } from './components/WelcomeSection';
import { useNeedsOnboarding } from './OnboardingGuard';
import { onboardingStepState } from './state/onboardingState';

/** Keyboard shortcuts of the steps live in the `welcome` scope while onboarding is open. */
const useWelcomeHotkeyScope = () => {
  const { setHotkeyScopeAndMemorizePreviousScope, goBackToPreviousHotkeyScope } =
    usePreviousHotkeyScope();

  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope('welcome');

    return () => goBackToPreviousHotkeyScope();
  }, [setHotkeyScopeAndMemorizePreviousScope, goBackToPreviousHotkeyScope]);
};

/** The section of the current step. */
const StepContent = ({
  step,
  steps,
  canInvite,
  exampleData,
  onStep,
  onFinish,
}: {
  step: number;
  steps: OnboardingStepDef[];
  canInvite: boolean;
  exampleData?: { value: boolean; onChange: (value: boolean) => void };
  onStep: (step: number) => void;
  onFinish: () => void;
}) => {
  if (step === 1) return <WelcomeSection steps={steps} onContinue={() => onStep(2)} />;

  if (step === 2) return <ProfileSection onContinue={() => onStep(3)} />;

  if (step === 3) return <ThemeSection onContinue={() => onStep(4)} />;

  if (canInvite && step === 4) return <InviteTeamMemberSection onContinue={() => onStep(5)} />;

  if (step === (canInvite ? 5 : 4)) {
    return <FinalSection exampleData={exampleData} onContinue={onFinish} />;
  }

  return null;
};

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
  const [storedStep, setCurrentStep] = useAtom(onboardingStepState);
  // Owners and admins may invite.
  const canInvite = useCan()('team.invite');
  const steps = useMemo(() => getOnboardingSteps(canInvite), [canInvite]);
  // A step kept from another layout (e.g. before invites were allowed) starts over.
  const currentStep = storedStep >= 1 && storedStep <= steps.length ? storedStep : 1;

  useWelcomeHotkeyScope();

  if (!needsOnboarding) return <Navigate to={paths.home} replace />;

  if (settingUp) {
    return (
      <SetupScreen
        exampleData={isOwner && exampleData}
        onDone={() => {
          setCurrentStep(1);
          void navigate(paths.home, { replace: true });
        }}
      />
    );
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
          <Appear
            key={currentStep}
            y={-6}
            duration={300}
            className="text-xs font-semibold uppercase tracking-wider text-primary-text"
          >
            Step {currentStep} of {steps.length}
          </Appear>
          <span className="h-px flex-1 bg-linear-to-r from-primary/60 to-transparent" />
        </div>
        <div className="flex w-5/6 flex-col items-center justify-center gap-4 lg:w-4/6">
          <StepContent
            step={currentStep}
            steps={steps}
            canInvite={canInvite}
            exampleData={isOwner ? { value: exampleData, onChange: setExampleData } : undefined}
            onStep={setCurrentStep}
            onFinish={() => setSettingUp(true)}
          />
        </div>
      </div>

      {currentStep > 1 && (
        <div className="flex items-center justify-center gap-2 absolute bottom-6 lg:hidden">
          <OnboardingStepper
            stepCount={steps.length}
            currentStep={currentStep}
            setCurrentStep={(index) => {
              const target = steps[index - 1];

              if (target && index <= currentStep) setCurrentStep(target.step);
            }}
          />
        </div>
      )}
    </div>
  );
};
