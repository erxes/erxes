import { useCallback } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createRoot } from 'react-dom/client';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AlertDialog, Form, Input } from 'erxes-ui/components';

type OptionProps = {
  okLabel?: string;
  cancelLabel?: string;
  description?: string;
  confirmationValue?: string;
};

type ConfirmDialogProp = {
  message: string;
  options?: OptionProps;
  open: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

export const confirmValidationSchema = z
  .object({
    confirm: z.string(),
  })
  .required();

export type FormType = z.infer<typeof confirmValidationSchema>;

const ConfirmDialog = ({
  message,
  options,
  open,
  onConfirm,
  onDismiss,
}: ConfirmDialogProp) => {
  const {
    okLabel = 'Confirm',
    cancelLabel = 'Cancel',
    description = '',
    confirmationValue = '',
  } = options || ({} as OptionProps);

  const form = useForm<FormType>({
    mode: 'onBlur',
    defaultValues: {
      confirm: '',
    },
    resolver: zodResolver(confirmValidationSchema),
  });

  const dismiss = () => {
    onDismiss();
  };

  const proceed: SubmitHandler<FormType> = () => {
    const { confirm } = form.getValues();

    if (confirmationValue) {
      if (confirm === confirmationValue) {
        return onConfirm();
      }

      return form.setError(
        'confirm',
        { type: 'custom', message: `Enter ${confirmationValue} to confirm` },
        { shouldFocus: true },
      );
    }

    return onConfirm();
  };

  const renderConfirm = (formInstance: ReturnType<typeof useForm>) => {
    if (!confirmationValue) {
      return null;
    }

    return (
      <Form.Field
        name="confirm"
        control={formInstance.control as any}
        render={({ field }: { field: any }) => (
          <Form.Item>
            <Form.Label className="text-xs">
              Type <span className='font-semibold'>{confirmationValue}</span> in the field below to
              confirm.
            </Form.Label>
            <Form.Control>
              <Input
                type="text"
                placeholder="Enter confirmation"
                {...field}
                autoFocus
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    );
  };

  return (
    <AlertDialog open={open}>
      <AlertDialog.Content>
        <Form {...form}>
          <AlertDialog.Header>
            <AlertDialog.Title>{message}</AlertDialog.Title>
            {description && (
              <AlertDialog.Description> {description} </AlertDialog.Description>
            )}
          </AlertDialog.Header>
          <form onSubmit={form.handleSubmit(proceed)}>
            {renderConfirm(form as any)}
            <br />
            <AlertDialog.Footer>
              <AlertDialog.Cancel onClick={dismiss} type="button">
                {cancelLabel}
              </AlertDialog.Cancel>
              <AlertDialog.Action type="submit">{okLabel}</AlertDialog.Action>
            </AlertDialog.Footer>
          </form>
        </Form>
      </AlertDialog.Content>
    </AlertDialog>
  );
};

export const useConfirm = () => {
  const confirm = useCallback(
    ({ message, options }: { message: string; options?: OptionProps }) => {
      return new Promise<void>((resolve) => {
        const wrapper = document.createElement('div');
        document.body.appendChild(wrapper);

        let isOpen = true;

        const cleanup = () => {
          if (!isOpen) return;

          isOpen = false;

          try {
            root.unmount();
          } catch (error) {
            console.error('Error unmounting confirm dialog:', error);
          } finally {
            wrapper.parentNode?.removeChild(wrapper);
          }
        };

        const handleConfirm = () => {
          resolve();
          cleanup();
        };

        const handleDismiss = () => {
          cleanup();
        };

        const root = createRoot(wrapper);
        root.render(
          <ConfirmDialog
            message={message}
            options={options}
            open={true}
            onConfirm={handleConfirm}
            onDismiss={handleDismiss}
          />,
        );
      });
    },
    [],
  );

  return { confirm };
};
