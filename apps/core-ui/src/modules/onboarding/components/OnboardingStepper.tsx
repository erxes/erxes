import { Button, cn } from 'erxes-ui';

export const OnboardingStepper = ({
  stepCount,
  currentStep,
  setCurrentStep,
}: {
  stepCount: number;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) => {
  return (
    <>
      {Array.from({ length: stepCount }, (_, index) => index + 1).map((step) => {
        const isActive = step === currentStep;

        return (
          <Button
            variant="secondary"
            key={step}
            onClick={() => setCurrentStep(step)}
            disabled={step > currentStep}
            className={cn(
              'relative transition-all rounded-full p-0 size-3 hover:bg-primary hover:scale-110',
              isActive && 'bg-primary',
            )}
            aria-label={`Go to step ${step}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="absolute inset-0 -m-3 md:-m-2" aria-hidden="true" />
          </Button>
        );
      })}
    </>
  );
};
