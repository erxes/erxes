import { IconCopy } from '@tabler/icons-react';
import { Button, toast } from 'erxes-ui';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { ITwoFactorSetup } from '@/auth/two-factor/types';

/** Scan in an authenticator app, or type the key when the camera is not an option. */
export const TwoFactorQr = ({ secret, otpauthUrl }: ITwoFactorSetup) => {
  const { t } = useTranslation('common', { keyPrefix: 'two-factor' });

  const copyKey = () =>
    navigator.clipboard
      .writeText(secret)
      .then(() => toast({ title: t('key-copied'), variant: 'success' }))
      .catch(() => toast({ title: t('copy-failed'), variant: 'destructive' }));

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-muted-foreground text-center">
        {t('scan-instructions')}
      </p>
      <div className="rounded-lg bg-white p-2">
        <QRCodeSVG value={otpauthUrl} size={136} />
      </div>
      <div className="flex w-full items-center gap-2 rounded-md border px-3 py-1">
        <code className="min-w-0 flex-1 break-all font-mono text-xs">
          {secret.match(/.{1,4}/g)?.join(' ')}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('copy-key')}
          onClick={copyKey}
        >
          <IconCopy />
        </Button>
      </div>
    </div>
  );
};
