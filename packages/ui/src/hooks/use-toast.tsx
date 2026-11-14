import type { ReactElement, ReactNode } from 'react';
import { Toast } from '@base-ui/react/toast';

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive';

export type ToastData = { action?: ReactElement };

/** The one queue every toast goes through; the Toaster renders it. */
export const toastManager = Toast.createToastManager<ToastData>();

export const toast = ({
  title,
  description,
  variant = 'default',
  action,
}: {
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  action?: ReactElement;
}) => {
  const id = toastManager.add({ title, description, type: variant, data: { action } });

  return { id, dismiss: () => toastManager.close(id) };
};

export const useToast = () => ({ toast });
