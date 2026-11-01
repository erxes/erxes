import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  MergeChoice,
  MergeConflictItem,
  MergeResultItem,
} from '@/contacts/companies/utils/companyMerge';
import { useCompaniesForMerge } from '@/contacts/companies/hooks/useCompaniesForMerge';
import { useCompaniesMergeFields } from '@/contacts/companies/hooks/useCompaniesMergeFields';
import { useCompaniesMergeSubmit } from '@/contacts/companies/hooks/useCompaniesMergeSubmit';

export interface ICompaniesMergeContext {
  open: boolean;
  setOpen: (open: boolean) => void;
  loading: boolean;
  /** Both companies are loaded and the merge can be saved. */
  ready: boolean;
  companyNames: { _id: string; name: string }[];
  conflicts: MergeConflictItem[];
  results: MergeResultItem[];
  selectChoice: (key: string, choice: MergeChoice) => void;
  save: () => void;
  saving: boolean;
}

export const CompaniesMergeContext =
  createContext<ICompaniesMergeContext | null>(null);

export const CompaniesMergeProvider = ({
  companyIds,
  children,
}: {
  companyIds: string[];
  children: ReactNode;
}) => {
  // The command bar passes a fresh array every render; keep one per selection
  // so memoized values below don't recompute (and reset picks) each render.
  const companyIdsKey = companyIds.join(',');
  const ids = useMemo(() => companyIdsKey.split(','), [companyIdsKey]);

  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const { companies, loading } = useCompaniesForMerge(ids, open);
  const { companyNames, conflicts, results, selectChoice, getCompanyFields } =
    useCompaniesMergeFields(companies);
  const { save, saving } = useCompaniesMergeSubmit({
    companyIds: ids,
    getCompanyFields,
    onMerged: close,
  });

  const value = useMemo<ICompaniesMergeContext>(
    () => ({
      open,
      setOpen,
      loading,
      ready: Boolean(companies),
      companyNames,
      conflicts,
      results,
      selectChoice,
      save,
      saving,
    }),
    [
      open,
      loading,
      companies,
      companyNames,
      conflicts,
      results,
      selectChoice,
      save,
      saving,
    ],
  );

  return (
    <CompaniesMergeContext.Provider value={value}>
      {children}
    </CompaniesMergeContext.Provider>
  );
};
