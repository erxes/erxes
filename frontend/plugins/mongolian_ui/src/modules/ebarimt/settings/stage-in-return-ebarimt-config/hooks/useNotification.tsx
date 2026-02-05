import { useToast } from 'erxes-ui';

export const useNotification = () => {
  const { toast } = useToast();

  const showSuccess = (message: string) => {
    toast({
      title: 'Success',
      description: message,
      variant: 'default',
    });
  };

  const showError = (message: string) => {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };

  const showConfigCreated = () => {
    showSuccess('Ebarimt return config created successfully');
  };

  const showConfigUpdated = () => {
    showSuccess('Ebarimt return config updated successfully');
  };

  const showConfigDeleted = () => {
    showSuccess('Ebarimt return config deleted successfully');
  };

  return {
    showSuccess,
    showError,
    showConfigCreated,
    showConfigUpdated,
    showConfigDeleted,
  };
};
