import './i18n';
import { MainOnboarding } from './MainOnboarding';

/** `/welcome`: first sign-in onboarding, full screen outside the main layout. */
export const MainOnboardingPage = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-background">
      <MainOnboarding />
    </div>
  );
};
