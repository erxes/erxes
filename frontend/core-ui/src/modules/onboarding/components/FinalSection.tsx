import { Button } from 'erxes-ui';
import { motion } from 'framer-motion';
import { IconCircleCheck } from '@tabler/icons-react';
import { useScopedHotkeys } from 'erxes-ui';

export const FinalSection = ({ onContinue }: { onContinue: () => void }) => {
  useScopedHotkeys(`enter`, () => onContinue(), 'welcome');
  useScopedHotkeys(`space`, () => onContinue(), 'welcome');
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
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: [0.34, 1.56, 0.64, 1],
          type: 'spring',
          stiffness: 100,
          damping: 15,
        }}
        className="flex items-center justify-center"
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
          <IconCircleCheck className="text-primary size-12" stroke={2} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col gap-2 items-center"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center">
          You're all set!
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground text-center px-4 max-w-md">
          Your workspace is ready. Start exploring and make the most of your
          experience operating system.
        </p>
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
          Start exploring
        </Button>
      </motion.div>
    </motion.div>
  );
};
