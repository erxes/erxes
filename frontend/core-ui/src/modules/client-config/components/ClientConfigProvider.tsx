import { useAtom } from 'jotai';
import { clientConfigApiStatusState } from 'ui-modules';
import { ClientConfigError } from '@/error-handler/components/ClientConfigError';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [apiStatus] = useAtom(clientConfigApiStatusState);

  if (!apiStatus.isLoaded) return null;

  return apiStatus.isErrored && apiStatus.error instanceof Error ? (
    <ClientConfigError error={apiStatus.error} />
  ) : (
    children
  );
};
