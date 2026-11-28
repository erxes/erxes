import type { TransferRecordType } from '@erxes/core-contract';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { orpc } from '@erxes/core-contract/client';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { paths } from '~/lib/paths';

/**
 * Starts an import of `recordType` from a file the member picks: it uploads the file and opens
 * the import wizard. Render `picker` (a hidden file input) and call `choose` from a button.
 */
export const useStartImport = (recordType: TransferRecordType) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });
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
      void navigate(paths.contacts.importOrExport(created.id));

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

  const picker = (
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
  );

  return { picker, choose: () => input.current?.click(), pending: start.isPending };
};
