import type { TransferRecordType } from '@erxes/core-contract';
import { IconFileImport } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Spinner, useToast } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { orpc } from '~/lib/api';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { useCan } from '~/modules/auth/session';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';

/** "Import": pick a CSV or Excel file; it is uploaded and opens in the import wizard. */
export const ImportButton = ({ recordType }: { recordType: TransferRecordType }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });
  const can = useCan();
  const navigate = useNavigate();
  const client = useQueryClient();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);

  const start = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadFile(file);

      return orpc.transfer.createImport.call({ recordType, fileId: uploaded.id });
    },
    onSuccess: (created) => {
      void navigate(`${CONTACT_SETTINGS.importExport}/${created.id}`);

      return client.invalidateQueries({ queryKey: orpc.transfer.imports.key() });
    },
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('upload-failed', 'Could not start the import'),
        description: uploadErrorMessage(error),
      }),
    onSettled: () => {
      if (input.current) input.current.value = '';
    },
  });

  if (!can('contacts.import')) return null;

  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        aria-label={t('import', 'Import')}
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) start.mutate(file);
        }}
      />
      <Button variant="outline" disabled={start.isPending} onClick={() => input.current?.click()}>
        {start.isPending ? <Spinner size="sm" /> : <IconFileImport />}
        {t('import', 'Import')}
      </Button>
    </>
  );
};
