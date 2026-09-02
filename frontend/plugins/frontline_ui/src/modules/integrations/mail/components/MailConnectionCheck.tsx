import {
  IconAlertTriangle,
  IconCircleCheck,
  IconPlugConnected,
} from '@tabler/icons-react';
import { Alert, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMailConnectionCheck } from '../hooks/useMailConnectionCheck';

export const MailConnectionCheck = () => {
  const { t } = useTranslation('frontline');
  const { checkConnection, result, loading } = useMailConnectionCheck();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{t('mail-connection-title')}</p>
          <p className="text-xs text-muted-foreground">
            {t('mail-connection-description')}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => checkConnection()}
          disabled={loading}
        >
          <IconPlugConnected size={16} />
          {loading ? t('checking') : t('check-connection')}
        </Button>
      </div>

      {result && (
        <Alert variant={result.ok ? 'default' : 'destructive'}>
          {result.ok ? (
            <IconCircleCheck className="h-4 w-4" />
          ) : (
            <IconAlertTriangle className="h-4 w-4" />
          )}
          <Alert.Title className="font-medium">
            {result.ok ? t('mail-connection-ok') : t('mail-connection-failed')}
          </Alert.Title>
          <Alert.Description className="mt-1 space-y-1 text-sm">
            <p className="text-muted-foreground">
              {t('mail-connection-tenant')}: <code>{result.tenant}</code>
            </p>
            {result.endpoint && (
              <p className="break-all text-muted-foreground">
                {t('mail-connection-endpoint')}: <code>{result.endpoint}</code>
              </p>
            )}
            {result.error && <p>{result.error}</p>}
          </Alert.Description>
        </Alert>
      )}
    </div>
  );
};
