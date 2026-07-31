import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { Input, type InputProps } from 'erxes-ui';
import { forwardRef, useId, useState } from 'react';

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'type'>
>(({ id: idProp, autoComplete = 'new-password', disabled, ...props }, ref) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        id={id}
        type={isVisible ? 'text' : 'password'}
        autoComplete={autoComplete}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsVisible((prev) => !prev)}
        className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-hidden focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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
  );
});

PasswordInput.displayName = 'PasswordInput';
