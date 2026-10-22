import { WelcomeMessageBackground } from 'ui-modules/modules/notifications/components/WelcomeMessageBackground';
import { MotionConfig, motion } from 'framer-motion';
import { WelcomeSocialSection } from 'ui-modules/modules/notifications/components/WelcomeSocialSection';
import {
  WELCOME_FALLBACK_SOCIALS,
  WELCOME_FALLBACK_VIDEO_SRC,
} from 'ui-modules/modules/notifications/constants/welcome';
import type { WelcomeNotificationFallbackProps } from 'ui-modules/modules/notifications/types/welcome';

export const WelcomeNotificationFallback = ({
  pluginName,
}: WelcomeNotificationFallbackProps) => {
  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full min-w-0 overflow-x-clip px-4 sm:px-8 md:px-20 py-12 lg:px-4 xl:px-12 relative min-h-full flex flex-col justify-center">
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
            <div className="w-full text-2xl font-semibold tracking-tight bg-clip-text ">
              <h1 className="capitalize inline">
                Welcome to {pluginName || 'erxes'}{' '}
              </h1>
              <span>plugin</span>
            </div>
            <p className="text-base text-muted-foreground">
              A New experience begins!
            </p>
          </motion.div>

          <div className="space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <video
                src={WELCOME_FALLBACK_VIDEO_SRC}
                className={`w-full h-full transition-opacity duration-300 bg-background rounded-xl border border-foreground/10 overflow-hidden`}
                autoPlay
              />
            </motion.div>
            <WelcomeSocialSection items={WELCOME_FALLBACK_SOCIALS} external />
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
};
