import { toast } from 'erxes-ui';

export const copyToClipboard = async (value: string, success: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast({ title: success, variant: 'default' });
  } catch {
    toast({ title: 'Failed to copy', variant: 'destructive' });
  }
};
