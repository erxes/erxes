import { OrgLogoIcon } from '@/auth/components/Logo';
import { Polygons } from '@/auth/components/Polygons';
import { cn, Spinner, TextEffect } from 'erxes-ui';
import { AnimatePresence, motion, Variants } from 'motion/react';
import { useEffect, useState } from 'react';

export const LoadingScreen = () => {
  return (
    <div className="h-dvh w-dvw p-2 bg-sidebar">
      <div className="flex flex-col items-center justify-center h-full w-full shadow-sm rounded-lg relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full overflow-hidden bg-[radial-gradient(50%_100%_at_50%_0%,#F0F1FE_0%,#F7F8FA_100%)] dark:bg-[radial-gradient(50%_100%_at_50%_0%,#0D0D0D_0%,#161616_100%)]"
        >
          <Polygons
            variant="welcome"
            className="absolute top-0 left-1/2 -translate-x-1/2"
          />
        </motion.div>
        <div className="flex flex-col gap-3 items-center justify-center relative z-10">
          <div className="size-10 rounded-lg shadow-xs flex items-center justify-center overflow-hidden">
            <IconAnimation />
          </div>
          <TextAnimation />
        </div>
      </div>
    </div>
  );
};
export const TextAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMoreText, setShowMoreText] = useState(false);

  useEffect(() => {
    const welcomeTextTimer = setTimeout(() => {
      setCurrentIndex(1);
    }, 2000);
    const loadingMessageTimer = setTimeout(() => {
      setShowMoreText(true);
    }, 4000);
    return () => {
      clearTimeout(welcomeTextTimer);
      clearTimeout(loadingMessageTimer);
    };
  }, []);

  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -10, opacity: 0 },
  };

  return (
    <div className="relative inline-block whitespace-nowrap text-center">
      <AnimatePresence mode="wait">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, delay: 0.2 }}
          variants={motionVariants}
          key={currentIndex}
        >
          {currentIndex === 0 && (
            <p className="text-primary text-sm">Welcome</p>
          )}

          {currentIndex === 1 && (
            <div className="relative w-0 mx-auto">
              <div
                className={cn(
                  'text-sm text-muted-foreground inline-flex gap-1 items-center text-nowrap transition-transform duration-1000 left-0 -translate-x-12',
                  showMoreText && '-translate-x-1/2',
                )}
              >
                Just a moment...
                {showMoreText && (
                  <TextEffect per="char">
                    good things come to those who wait!
                  </TextEffect>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
export const IconAnimation = () => {
  const iconVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const spinnerTimer = setTimeout(() => {
      setShowSpinner(true);
    }, 2000);
    return () => clearTimeout(spinnerTimer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={showSpinner ? 'spinner' : 'logo'}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        variants={iconVariants}
      >
        {showSpinner ? (
          <Spinner />
        ) : (
          <OrgLogoIcon className="size-7 text-primary" />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
