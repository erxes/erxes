import type { ReactNode, RefObject } from 'react';
export type TSocialItem = {
  icon: ReactNode;
  url: string;
  label: string;
};
export type TOnboardingStepItem = {
  id: string;
  icon: ReactNode;
  title: string;
  forOwner?: boolean;
  description: string;
  action: {
    label: string;
    to: string | false;
  };
};
export type TVideoTabItem = {
  label: string;
  icon: ReactNode;
  time?: number;
};

export interface WelcomeSocialSectionProps {
  items: TSocialItem[];
  external?: boolean;
}
export interface WelcomeOnboardingCardProps {
  item: TOnboardingStepItem;
}
export interface WelcomeOnboardingGridProps {
  items: TOnboardingStepItem[];
}
export interface WelcomeOnboardingStepsSectionProps {
  isOwner: boolean;
  onboardingSteps: TOnboardingStepItem[];
}
export interface WelcomeVideoPlayerProps {
  src: string;
  tabItems?: TVideoTabItem[];
  poster?: string;
}
export interface WelcomeVideoPlayerState {
  isLoaded: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  youtubeEmbedSrc: string | null;
  activeTabLabel: string | null;
  handleTimeUpdate: () => void;
  handleTabClick: (item: TVideoTabItem) => void;
  handleLoaded: () => void;
}
export interface WelcomeNotificationContentLayoutProps {
  title: string;
  description: string;
  tabItems?: TVideoTabItem[];
  videoSrc: string;
  videoPoster?: string;
  onboardingSteps: TOnboardingStepItem[];
  isPlugin?: boolean;
}
export interface WelcomeNotificationFallbackProps {
  pluginName?: string;
}

export type WelcomeVideoPlayerOptions = Pick<
  WelcomeVideoPlayerProps,
  'src' | 'tabItems'
>;
