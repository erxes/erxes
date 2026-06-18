import { toast } from 'erxes-ui';

/**
 * Apollo `onError` handler that surfaces the failure as a destructive toast.
 *
 * Usage: `useMutation(DOC, { onError: toastError() })`, or pass a title for a
 * more specific message, e.g. `toastError('Save failed')`.
 */
export const toastError =
  (title = 'Error') =>
  (e: Error) =>
    toast({ title, description: e.message, variant: 'destructive' });
