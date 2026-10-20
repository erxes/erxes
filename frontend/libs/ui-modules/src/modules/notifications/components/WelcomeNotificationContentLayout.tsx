import { cn } from 'erxes-ui';
import { currentOrganizationState, currentUserState } from 'ui-modules/states';
import { WelcomeMessageBackground } from 'ui-modules/modules/notifications/components/WelcomeMessageBackground';
import { MotionConfig, motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { WelcomeVideoPlayer } from 'ui-modules/modules/notifications/components/WelcomeVideoPlayer';
import { WelcomeOnboardingStepsSection } from 'ui-modules/modules/notifications/components/WelcomeOnboardingStepsSection';
import { WelcomeSocialSection } from 'ui-modules/modules/notifications/components/WelcomeSocialSection';
import { WELCOME_SOCIALS } from 'ui-modules/modules/notifications/constants/welcome';
import type { WelcomeNotificationContentLayoutProps } from 'ui-modules/modules/notifications/types/welcome';
export { OnboardingSteps } from 'ui-modules/modules/notifications/constants/welcome';

export const WelcomeNotificationContentLayout = ({
  title,
  description,
  tabItems,
  videoSrc,
  videoPoster,
  onboardingSteps,
  isPlugin = true,
}: WelcomeNotificationContentLayoutProps) => {
  const currentUser = useAtomValue(currentUserState);
  const organization = useAtomValue(currentOrganizationState);

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full min-w-0 overflow-x-clip px-4 sm:px-8 md:px-20 py-12 lg:px-4 xl:px-12 relative">
        <WelcomeMessageBackground className="absolute inset-0 z-0" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl min-w-0 mx-auto space-y-8 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2 text-center"
          >
            <h1
              className={cn(
                'text-2xl font-semibold tracking-tight bg-clip-text',
                isPlugin ? 'text-foreground' : 'text-primary',
              )}
            >
              {organization?.orgCustomOnboarding
                ? `Welcome to ${organization?.orgShortName}`
                : title}
            </h1>
            <p className="text-base text-muted-foreground">
              {organization?.orgCustomOnboarding
                ? organization?.orgShortDescription
                : description}
            </p>
          </motion.div>
          {organization?.orgCustomOnboarding && (
            <div className="space-y-8 relative z-10">
              <img
                src={organization?.orgLogo}
                alt="Organization Logo"
                className="w-full h-auto mx-auto"
              />
            </div>
          )}

          {!organization?.orgCustomOnboarding && (
            <div className="space-y-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <WelcomeVideoPlayer
                  src={videoSrc}
                  tabItems={tabItems}
                  poster={videoPoster}
                />
              </motion.div>
              <WelcomeOnboardingStepsSection
                isOwner={currentUser?.isOwner || false}
                onboardingSteps={onboardingSteps}
              />
              <WelcomeSocialSection items={WELCOME_SOCIALS} />
            </div>
          )}
        </motion.div>
      </div>
    </MotionConfig>
  );
};
