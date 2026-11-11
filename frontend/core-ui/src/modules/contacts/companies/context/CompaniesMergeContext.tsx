import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
  useRef,
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
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<string[]>([]);
  const session = useRef(0);
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next && !open) {
        session.current += 1;
        setSnapshot([...companyIds]);
      }
      setOpen(next);
    },
    [companyIds, open],
  );
  const ownerSession = session.current;
  const close = useCallback(() => {
    if (session.current === ownerSession) setOpen(false);
  }, [ownerSession]);
  const idsKey = (open ? snapshot : companyIds).join(',');
  const ids = useMemo(() => (idsKey ? idsKey.split(',') : []), [idsKey]);

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
      setOpen: handleOpenChange,
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
      handleOpenChange,
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
