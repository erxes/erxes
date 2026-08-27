'use client';

import { Input } from 'erxes-ui/components/input';
import { Textarea } from 'erxes-ui/components/textarea';
import { useState, type ComponentProps } from 'react';
import { cn } from '@/modules/ui/lib/cn';
import { Icon } from './Icon';

/**
 * `erxes-ui` sizes and outlines its input for the dense admin app. Public forms
 * want a taller target and a filled, borderless field, so both are set here in
 * one place rather than at every call site.
 */
const field =
  'h-11 rounded-lg bg-subtle px-3.5 text-[15px] shadow-none focus-visible:shadow-focus';

export const TextInput = ({
  className,
  ...props
}: ComponentProps<typeof Input>) => (
  <Input {...props} className={cn(field, className)} />
);

export const PasswordInput = ({
  className,
  ...props
}: ComponentProps<typeof Input>) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn(field, 'pr-11', className)}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Нууц үг нуух' : 'Нууц үг харуулах'}
        className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white hover:text-ink"
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={17} />
      </button>
    </div>
  );
};

export const TextareaInput = ({
  className,
  ...props
}: ComponentProps<typeof Textarea>) => (
  <Textarea
    {...props}
    className={cn(
      'rounded-lg bg-subtle px-3.5 py-3 text-[15px] shadow-none focus-visible:shadow-focus',
      className,
    )}
  />
);
