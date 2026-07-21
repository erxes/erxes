import { useTranslation } from 'react-i18next';
import { Spinner } from 'erxes-ui';

interface LogLoadingProps {
  readonly message?: string;
}

export function LogLoading({ message }: LogLoadingProps) {
  const { t } = useTranslation('common');
  const displayMessage = message ?? t('logs.loading', 'Loading...');
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-sm text-muted-foreground font-medium">{displayMessage}</p>
      </div>
    </div>
  );
}
