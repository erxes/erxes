import { BotRunner } from '@/error-handler/components/BotRunner';
import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';
import { useBackendRecovery } from '@/error-handler/hooks/useBackendRecovery';

type ClientConfigErrorProps = {
  error?: Error;
};

export const ClientConfigError = ({ error }: ClientConfigErrorProps) => {
  useBackendRecovery();

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <GenericErrorFallback
      error={error}
      resetErrorBoundary={handleReset}
      title="Unable to reach backend"
    >
      <BotRunner />
    </GenericErrorFallback>
  );
};
