import { OrgLogoIcon } from '@/auth/components/Logo';
import { Button, useScopedHotkeys } from 'erxes-ui';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { currentOrganizationState } from 'ui-modules';

export const WelcomeSection = ({ onContinue }: { onContinue: () => void }) => {
  useScopedHotkeys(`enter`, () => onContinue(), 'welcome');
  useScopedHotkeys(`space`, () => onContinue(), 'welcome');

  const organization = useAtomValue(currentOrganizationState);

  return (
    <div className="flex flex-col items-center justify-center gap-10 max-w-sm mx-auto px-6 scale-110 -translate-y-10">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1],
          type: 'spring',
          stiffness: 100,
          damping: 15,
        }}
        className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.6,
            ease: 'easeOut',
          }}
        >
          <OrgLogoIcon strokeWidth={2} className="text-primary size-16" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <h1 className=" font-semibold text-foreground text-[2.3rem]">
          Welcome to{' '}
          {organization?.orgCustomOnboarding
            ? organization?.orgShortName
            : 'erxes'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          {!organization?.orgCustomOnboarding &&
            'An open-source experience operating system (XOS)'}
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-12"
        tabIndex={-1}
      >
        <Button
          className="w-full cursor-pointer"
          size="lg"
          variant={'secondary'}
          onClick={onContinue}
        >
          Get started
        </Button>
      </motion.div>
    </div>
  );
};
