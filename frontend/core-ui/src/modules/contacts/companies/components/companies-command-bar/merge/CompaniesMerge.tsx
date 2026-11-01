import { CompaniesMergeProvider } from '@/contacts/companies/context/CompaniesMergeContext';
import { CompaniesMergeSheet } from './CompaniesMergeSheet';
import { CompaniesMergeContent } from './CompaniesMergeContent';
import { useCompaniesMergeContext } from '@/contacts/companies/hooks/useCompaniesMergeContext';

const MERGEABLE_COUNT = 2;

export const CompaniesMerge = ({ companyIds }: { companyIds: string[] }) => {
  const disabled = companyIds.length !== MERGEABLE_COUNT;

  if (disabled) return <CompaniesMergeSheet disabled />;

  return (
    <CompaniesMergeProvider companyIds={companyIds}>
      <CompaniesMergeSheetContainer />
    </CompaniesMergeProvider>
  );
};

const CompaniesMergeSheetContainer = () => {
  const { open, setOpen, save, saving, ready } = useCompaniesMergeContext();
  const saveDisabled = !ready;
  const handleDiscard = () => setOpen(false);

  return (
    <CompaniesMergeSheet
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
