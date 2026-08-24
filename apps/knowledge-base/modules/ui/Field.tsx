import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

const control =
  'w-full rounded-lg border bg-white px-3.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-brand';

export const Field = ({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
      {label}
      {required ? <span className="ml-1 text-danger">*</span> : null}
    </label>
    {children}
    {error ? (
      <p
        id={`${htmlFor}-error`}
        role="alert"
        className="flex items-center gap-1.5 text-[13px] text-danger"
      >
        <Icon name="alert" size={14} />
        {error}
      </p>
    ) : hint ? (
      <p className="text-[13px] text-muted">{hint}</p>
    ) : null}
  </div>
);

export const TextInput = ({
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) => (
  <input
    className={cn(control, 'h-11', invalid ? 'border-danger' : 'border-line', className)}
    aria-invalid={invalid || undefined}
    {...props}
  />
);

export const TextArea = ({
  invalid,
  className,
  rows = 6,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) => (
  <textarea
    rows={rows}
    className={cn(control, 'py-2.5 leading-relaxed', invalid ? 'border-danger' : 'border-line', className)}
    aria-invalid={invalid || undefined}
    {...props}
  />
);

export const Select = ({
  invalid,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) => (
  <select
    className={cn(
      control,
      'h-11 appearance-none bg-[length:0] pr-9',
      invalid ? 'border-danger' : 'border-line',
      className,
    )}
    aria-invalid={invalid || undefined}
    {...props}
  >
    {children}
  </select>
);
