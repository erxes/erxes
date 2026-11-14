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
          // A dot, not a button's look: a plain button with the focus ring Button uses.
          <button
            type="button"
            key={step}
            onClick={() => setCurrentStep(step)}
            disabled={step > currentStep}
            className="relative size-3 cursor-pointer rounded-full bg-accent outline-offset-2 transition hover:scale-110 hover:bg-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 aria-[current=step]:bg-primary"
            aria-label={`Go to step ${step}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="absolute inset-0 -m-3 md:-m-2" aria-hidden="true" />
          </button>
        );
      })}
    </>
  );
};
