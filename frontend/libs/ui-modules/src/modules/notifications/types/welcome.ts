export type TSocialItem = {
  icon: React.ReactNode;
  url: string;
};
export type TOnboardingStepItem = {
  icon: React.ReactNode;
  title: string;
  forOwner?: boolean;
  description: string;
  action: {
    label: string;
    to: string;
  };
};
export type TReadOnlyTabItem = {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
};

