import { WelcomeSection } from './components/WelcomeSection';
import { UserCredentialSection } from './components/UserCredentialSection';
import { ThemeSection } from './components/ThemeSection';
import { FinalSection } from './components/FinalSection';
import { useState } from 'react';
import { cn } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { UserMoreInfoForm } from './components/UserMoreInfoSection';
import { useVersion } from 'ui-modules';

export const MainOnboarding = () => {
  const isSaas = !useVersion();
  const stepCount = isSaas ? 4 : 5;

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

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

      {currentStep === (isSaas ? 4 : 5) && (
        <FinalSection onContinue={() => navigate('/')} />
      )}

      <div className="flex items-center justify-center gap-2 absolute bottom-6">
        {Array.from({ length: stepCount }).map((_, index) => (
          <span
            key={index}
            className={cn('transition-all size-2 rounded-full bg-muted ', {
              'bg-primary': index === currentStep - 1,
            })}
          />
        ))}
      </div>
    </>
  );
};
