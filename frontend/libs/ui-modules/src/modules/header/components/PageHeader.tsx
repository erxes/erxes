import { IconStar } from '@tabler/icons-react';

import { Button, Separator, Sidebar } from 'erxes-ui';
import { cn } from 'erxes-ui';
import { motion, AnimatePresence } from 'motion/react';
import { useToggleFavorite } from '../hooks/useToggleFavorite';
import React, { useState } from 'react';

export const PageHeaderRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    className?: string;
    separatorClassName?: string;
  }
>(({ children, className, separatorClassName, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      <header
        className={cn(
          'flex items-center justify-between h-[3.25rem] px-3 box-border flex-shrink-0 bg-sidebar overflow-auto styled-scroll',
          className,
        )}
      >
        {children}
      </header>
      <Separator className={cn('w-auto flex-none', separatorClassName)} />
    </div>
  );
});

PageHeaderRoot.displayName = 'PageHeaderRoot';

export const PageHeaderStart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 flex-none pr-8', className)}
      {...props}
    >
      <Sidebar.Trigger />
      <Separator.Inline />
      {children}
    </div>
  );
});

PageHeaderStart.displayName = 'PageHeaderStart';

export const PageHeaderEnd = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
  }
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
});

PageHeaderEnd.displayName = 'PageHeaderEnd';

const animations = {
  icon: {
    initial: { scale: 1, rotate: 0 },
    tapActive: { scale: 0.85, rotate: -10 },
    tapCompleted: { scale: 1, rotate: 0 },
  },
  burst: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: [0, 1.4, 1], opacity: [0, 0.4, 0] },
    transition: { duration: 0.7, ease: 'easeOut' },
  },
  particles: (index: number) => {
    const angle = (index / 5) * (2 * Math.PI);
    const radius = 18 + Math.random() * 8;
    const scale = 0.8 + Math.random() * 0.4;
    const duration = 0.6 + Math.random() * 0.1;

    return {
      initial: { scale: 0, opacity: 0.3, x: 0, y: 0 },
      animate: {
        scale: [0, scale, 0],
        opacity: [0.3, 0.8, 0],
        x: [0, Math.cos(angle) * radius],
        y: [0, Math.sin(angle) * radius * 0.75],
      },
      transition: { duration, delay: index * 0.04, ease: 'easeOut' },
    };
  },
};

export function FavoriteToggleIconButton() {
  const { isFavorite, toggleFavorite } = useToggleFavorite();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    toggleFavorite();
    if (!isFavorite) {
      setIsAnimating(true);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <Button
        variant={isFavorite ? 'secondary' : 'ghost'}
        size="icon"
        onClick={handleToggle}
        aria-pressed={isFavorite}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isFavorite ? 1.1 : 1 }}
          whileTap={
            isFavorite
              ? animations.icon.tapCompleted
              : animations.icon.tapActive
          }
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="relative flex items-center justify-center"
        >
          <IconStar
            className={isFavorite ? 'opacity-0' : 'opacity-60'}
            size={16}
            aria-hidden="true"
          />

          <IconStar
            className="absolute inset-0 text-amber-500 fill-amber-500 transition-all duration-300"
            size={16}
            aria-hidden="true"
            style={{ opacity: isFavorite ? 1 : 0 }}
          />

          <AnimatePresence>
            {isAnimating && isFavorite && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0) 80%)',
                }}
                {...animations.burst}
                onAnimationComplete={() => setIsAnimating(false)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </Button>

      <AnimatePresence>
        {isAnimating && isFavorite && (
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-amber-500"
                style={{
                  width: `${4 + Math.random() * 2}px`,
                  height: `${4 + Math.random() * 2}px`,
                  filter: 'blur(1px)',
                  transform: 'translate(-50%, -50%)',
                }}
                initial={animations.particles(i).initial}
                animate={animations.particles(i).animate}
                transition={animations.particles(i).transition}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const PageHeader = Object.assign(PageHeaderRoot, {
  Start: PageHeaderStart,
  End: PageHeaderEnd,
  FavoriteToggleButton: FavoriteToggleIconButton,
});
