import { CompaniesMergeProvider } from '@/contacts/companies/context/CompaniesMergeContext';
import { CompaniesMergeSheet } from './CompaniesMergeSheet';
import { CompaniesMergeContent } from './CompaniesMergeContent';
import { useCompaniesMergeContext } from '@/contacts/companies/hooks/useCompaniesMergeContext';

const MERGEABLE_COUNT = 2;

export const CompaniesMerge = ({ companyIds }: { companyIds: string[] }) => {
  const disabled = companyIds.length !== MERGEABLE_COUNT;

  return (
    <CompaniesMergeProvider companyIds={companyIds}>
      <CompaniesMergeSheetContainer disabled={disabled} />
    </CompaniesMergeProvider>
  );
};

const CompaniesMergeSheetContainer = ({ disabled }: { disabled: boolean }) => {
  const { open, setOpen, save, saving, ready } = useCompaniesMergeContext();
  const saveDisabled = !ready;
  const handleDiscard = () => setOpen(false);

  return (
    <CompaniesMergeSheet
      disabled={disabled && !open}
      open={open}
      onOpenChange={setOpen}
      onDiscard={handleDiscard}
      onSave={save}
      saving={saving}
      saveDisabled={saveDisabled}
    >
      <CompaniesMergeContent />
    </CompaniesMergeSheet>
  );
};
