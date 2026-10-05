import { Button, cn, themeState } from 'erxes-ui';

import type { ThemeOption } from 'erxes-ui';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

const THEME_OPTIONS: { value: ThemeOption; label: string; src: string }[] = [
  { value: 'system', label: 'System', src: '/assets/ui-system.webp' },
  { value: 'light', label: 'Light', src: '/assets/ui-light.webp' },
  { value: 'dark', label: 'Dark', src: '/assets/ui-dark.webp' },
];

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
      className="flex w-full flex-col gap-10 px-4 sm:-translate-y-10"
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
        className="grid w-full grid-cols-3 gap-3 sm:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        {THEME_OPTIONS.map(({ value, label, src }) => (
          <div key={value} className="flex flex-col gap-2 items-center">
            <div
              className={cn(
                'aspect-[4/3] w-full max-w-[220px] overflow-hidden rounded-lg bg-muted transition-all',
                theme === value
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'hover:shadow-md',
              )}
            >
              <img
                role="button"
                tabIndex={0}
                src={src}
                alt={`${label} Theme`}
                onClick={() => setTheme(value)}
                onKeyDown={(e) => handleKeyDown(e, () => setTheme(value))}
                draggable={false}
                aria-pressed={theme === value}
                className="h-full w-full cursor-pointer select-none rounded-lg object-cover"
              />
            </div>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                theme === value ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {label}
            </span>
          </div>
        ))}
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
