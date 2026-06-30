import { IconBrain } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { motion } from 'motion/react';

export const TypingStatus = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-end justify-start gap-2"
    >
      <div className="size-8 shrink-0 rounded-full bg-primary text-primary-foreground flex self-end items-center justify-center">
        <IconBrain size={20} />
      </div>
      <div className="space-y-0.5">
        <div className="text-[11px] text-muted-foreground px-1 font-medium">
          Ai Agent{' '}
          <Badge
            variant={'ghost'}
            className="text-[10px] leading-none rounded-xl bg-primary/15 text-primary h-auto py-0.5"
          >
            Auto
          </Badge>
        </div>
        <div className="inline-flex flex-none items-center gap-1.5 p-3 bg-background rounded-2xl rounded-bl-sm shadow-sm">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block size-1 rounded-full"
              animate={{
                y: [0, -5, 0],
                backgroundColor: [
                  'var(--color-accent)',
                  'var(--color-primary)',
                  'var(--color-accent)',
                ],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                repeatType: 'loop',
                delay: i * 0.18,
                ease: [0.45, 0, 0.55, 1],
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
