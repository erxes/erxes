'use client';

import { Input } from 'erxes-ui/components/input';
import { Textarea } from 'erxes-ui/components/textarea';
import { useState, type ComponentProps } from 'react';
import { cn } from '@/modules/ui/lib/cn';
import { Icon } from './Icon';

const field =
  'h-11 rounded-lg border border-line bg-white px-3.5 text-[15px] shadow-none transition-[border-color,box-shadow] duration-300 ease-out-soft placeholder:text-muted-foreground/60 hover:border-line-strong focus-visible:border-brand focus-visible:shadow-focus';

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
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-300 ease-out-soft hover:bg-subtle hover:text-ink focus-visible:bg-subtle focus-visible:text-ink"
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
      'rounded-lg border border-line bg-white px-3.5 py-3 text-[15px] shadow-none transition-[border-color,box-shadow] duration-300 ease-out-soft placeholder:text-muted-foreground/60 hover:border-line-strong focus-visible:border-brand focus-visible:shadow-focus',
      className,
    )}
  />
);
