import { toast } from 'erxes-ui';

export const notifySuccess = (description: string) =>
  toast({ title: 'Success', description });

export const notifyError = (error: unknown) =>
  toast({
    title: 'Error',
    description:
      error instanceof Error ? error.message : 'Something went wrong',
    variant: 'destructive',
  });
