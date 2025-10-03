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
export type TVideoTabItem = {
  label: string;
  icon: React.ReactNode;
  time?: number;
};
