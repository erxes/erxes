import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';

type ClientConfigErrorProps = {
  error?: Error;
};

export const ClientConfigError = ({ error }: ClientConfigErrorProps) => {
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <GenericErrorFallback
      error={error}
      resetErrorBoundary={handleReset}
      title="Unable to Reach Back-end"
    />
  );
};
