import { themeState, cn, Button } from 'erxes-ui';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';

export const ThemeSection = ({ onContinue }: { onContinue: () => void }) => {
  const [theme, setTheme] = useAtom(themeState);

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="flex flex-col gap-10 sm:-translate-y-10 md:-translate-y-10 px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-2 items-center"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center">
          Choose your theme
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
          Select the appearance that suits your preference
        </p>
      </motion.div>
      <motion.div
        className="flex gap-4 md:gap-6 flex-wrap justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <div className="flex flex-col gap-2 items-center">
          <img
            role="button"
            tabIndex={0}
            src={'/assets/ui-light.webp'}
            alt="Light Theme"
            onClick={() => setTheme('light')}
            onKeyDown={(e) => handleKeyDown(e, () => setTheme('light'))}
            draggable={false}
            aria-pressed={theme === 'light'}
            className={cn(
              'rounded-lg cursor-pointer transition-all w-full max-sm:max-w-[100px] sm:max-w-none sm:w-auto select-none',
              theme === 'light'
                ? 'shadow-focus ring-2 ring-primary'
                : 'hover:shadow-md',
            )}
          />
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              theme === 'light' ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-hidden="true"
          >
            Light
          </span>
        </div>

        <div className="flex flex-col gap-2 items-center">
          <img
            role="button"
            tabIndex={0}
            src={'/assets/ui-dark.webp'}
            alt="Dark Theme"
            onClick={() => setTheme('dark')}
            onKeyDown={(e) => handleKeyDown(e, () => setTheme('dark'))}
            draggable={false}
            aria-pressed={theme === 'dark'}
            className={cn(
              'rounded-lg cursor-pointer transition-all w-full max-sm:max-w-[100px] sm:max-w-none sm:w-auto select-none ',
              theme === 'dark'
                ? 'shadow-focus ring-2 ring-primary'
                : 'hover:shadow-md',
            )}
          />
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              theme === 'dark' ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-hidden="true"
          >
            Dark
          </span>
        </div>

        <div className="flex flex-col gap-2 items-center">
          <img
            role="button"
            tabIndex={0}
            src={'/assets/ui-system.webp'}
            alt="System Theme"
            onClick={() => setTheme('system')}
            onKeyDown={(e) => handleKeyDown(e, () => setTheme('system'))}
            draggable={false}
            aria-pressed={theme === 'system'}
            className={cn(
              'rounded-lg cursor-pointer transition-all w-full max-sm:max-w-[100px] sm:max-w-none sm:w-auto select-none',
              theme === 'system'
                ? 'shadow-focus ring-2 ring-primary'
                : 'hover:shadow-md',
            )}
          />
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              theme === 'system' ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-hidden="true"
          >
            System
          </span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 sm:px-12 lg:px-20"
        tabIndex={-1}
      >
        <Button
          className="w-full cursor-pointer"
          size="lg"
          variant={'secondary'}
          onClick={onContinue}
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
};
