import React from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';

import { useRender } from '@base-ui/react/use-render';

import { Label } from './label';
import { cn } from '../lib/utils';

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fallbackId = React.useId();

  // Outside a field the parts render without field state; outside an item, with their own id.
  const fieldState = fieldContext
    ? getFieldState(fieldContext.name, formState)
    : { error: undefined };

  const id = itemContext?.id ?? fallbackId;

  return {
    id,
    name: fieldContext?.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

const FormItem = ({ ref, className, ...props }: React.ComponentProps<'div'>) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
    </FormItemContext.Provider>
  );
};

const FormLabel = ({ className, ...props }: React.ComponentProps<typeof Label>) => {
  const { error, formItemId } = useFormField();

  return (
    <Label className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />
  );
};

/** Gives its one child the field's id and its description and error wiring. */
const FormControl = ({
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLElement>, 'children'> & { children: React.ReactElement }) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return useRender({
    render: children,
    props: {
      id: formItemId,
      'aria-describedby': !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`,
      'aria-invalid': !!error,
      ...props,
    },
  });
};

const FormDescription = ({ ref, className, ...props }: React.ComponentProps<'p'>) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-xs text-accent-foreground', className)}
      {...props}
    />
  );
};

const FormMessage = ({ ref, className, children, ...props }: React.ComponentProps<'p'>) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body || body === 'undefined') {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-xs', error && 'text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
};

export const Form = Object.assign(FormProvider, {
  Control: FormControl,
  Description: FormDescription,
  Field: FormField,
  Item: FormItem,
  Label: FormLabel,
  Message: FormMessage,
  useField: useFormField,
});
