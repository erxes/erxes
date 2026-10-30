import { IconCopy, IconDownload } from '@tabler/icons-react';
import { Button, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Shown once, right after the codes are made; the server keeps only hashes. */
export const RecoveryCodes = ({
  codes,
  onDone,
  doneLabel,
}: {
  codes: string[];
  onDone: () => void;
  doneLabel: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'two-factor' });
  const text = codes.join('\n');

  const copy = () =>
    navigator.clipboard
      .writeText(text)
      .then(() => toast({ title: t('codes-copied'), variant: 'success' }))
      .catch(() => toast({ title: t('copy-failed'), variant: 'destructive' }));

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'erxes-recovery-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-semibold">{t('recovery-codes-title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('recovery-codes-description')}
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-2 rounded-lg border p-4 font-mono text-sm">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={copy}>
          <IconCopy /> {t('copy')}
        </Button>
        <Button type="button" variant="outline" onClick={download}>
          <IconDownload /> {t('download')}
        </Button>
      </div>
      <Button type="button" onClick={onDone}>
        {doneLabel}
      </Button>
    </div>
  );
};
