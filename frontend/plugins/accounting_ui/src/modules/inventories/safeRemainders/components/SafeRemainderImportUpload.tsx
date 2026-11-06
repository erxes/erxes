import { IconUpload } from '@tabler/icons-react';
import { Button, Spinner, cn } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeRemainderImportSession } from '@/inventories/safeRemainders/hooks/useSafeRemainderImport';

export const SafeRemainderImportUpload = ({
  session,
  disabled,
}: {
  session: SafeRemainderImportSession;
  disabled: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { format, fileName, reading, readFile } = session;

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed p-4 space-y-3',
        dragOver && 'border-primary bg-primary/5',
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        void readFile(event.dataTransfer.files[0]);
      }}
    >
      <p className="text-sm text-muted-foreground">
        {format === 'csv'
          ? t('safe-import-upload-description', {
              defaultValue:
                'Загварыг бөглөөд CSV файлаа энд чирж оруулах эсвэл сонгоно уу. Дараа нь багануудыг тааруулна.',
            })
          : t(
              'headerless-code-count-rows-the-system-retrieves-the-recorded-total-cost',
            )}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={format === 'csv' ? '.csv,text/csv' : '.txt,text/plain'}
        className="hidden"
        onChange={(event) => {
          void readFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <Button
        variant="secondary"
        disabled={disabled || reading}
        onClick={() => inputRef.current?.click()}
      >
        {reading ? <Spinner size="sm" /> : <IconUpload />}
        {t(format === 'csv' ? 'import-csv' : 'import-txt')}
      </Button>
      {fileName && <p className="break-all text-sm font-medium">{fileName}</p>}
    </div>
  );
};
