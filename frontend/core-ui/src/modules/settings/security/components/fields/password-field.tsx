import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { Input } from 'erxes-ui';
import React, { ComponentProps, FC, useId, useState } from 'react';

export const PasswordInput: FC<Omit<ComponentProps<typeof Input>, 'type'>> = ({
  ...props
}) => {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  return (
    <div className="*:not-first:mt-2">
      <label htmlFor={id} />
      <div className="relative">
        <Input id={id} type={isVisible ? 'text' : 'password'} {...props} />
        <button
          tabIndex={-1}
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          aria-controls={id}
        >
          {isVisible ? (
            <IconEyeOff size={16} aria-hidden="true" />
          ) : (
            <IconEye size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
};
