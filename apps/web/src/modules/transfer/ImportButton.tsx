import type { TransferRecordType } from '@erxes/core-contract';
import { IconFileImport } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useStartImport } from './useStartImport';
import { useTransferType } from './useTransfer';

/** "Import": pick a CSV or Excel file; it is uploaded and opens in the import wizard. */
export const ImportButton = ({ recordType }: { recordType: TransferRecordType }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });
  const type = useTransferType(recordType);
  const { picker, choose, pending } = useStartImport(recordType);

  if (!type?.canImport) return null;

  return (
    <>
      {picker}
      <Button variant="outline" disabled={pending} onClick={choose}>
        {pending ? <Spinner size="sm" /> : <IconFileImport />}
        {t('import', 'Import')}
      </Button>
    </>
  );
};
