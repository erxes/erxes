import { Spinner } from 'erxes-ui';
import { useCompaniesMergeContext } from '@/contacts/companies/hooks/useCompaniesMergeContext';
import { CompaniesMergeConflicts } from './CompaniesMergeConflicts';
import { CompaniesMergeResult } from './CompaniesMergeResult';

export const CompaniesMergeContent = () => {
  const { loading, ready } = useCompaniesMergeContext();

  if (loading) {
    return (
      <div className="flex w-full justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (!ready) return null;

  return (
    <div className="p-6 flex gap-2 items-start">
      <CompaniesMergeConflicts />
      <CompaniesMergeResult />
    </div>
  );
};
