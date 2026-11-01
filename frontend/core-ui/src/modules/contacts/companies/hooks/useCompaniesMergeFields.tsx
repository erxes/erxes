import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MergeChoice,
  MergeCompany,
  MergeSelection,
  buildCompanyMergeFields,
  buildMergeConflicts,
  buildMergeResults,
  buildMergeRows,
  getCompanyMergeName,
} from '@/contacts/companies/utils/companyMerge';

/**
 * The user's pick for each conflicting field, plus everything the sheet
 * renders, derived from the two companies.
 */
export const useCompaniesMergeFields = (
  companies: [MergeCompany, MergeCompany] | null,
) => {
  const [selection, setSelection] = useState<MergeSelection>({});

  // Picks belong to one pair of companies; start over for a different pair.
  const pairKey = companies?.map((company) => company._id).join(',');
  useEffect(() => {
    setSelection({});
  }, [pairKey]);

  const rows = useMemo(
    () => (companies ? buildMergeRows(companies) : []),
    [companies],
  );

  const companyNames = useMemo(
    () =>
      (companies || []).map((company) => ({
        _id: company._id,
        name: getCompanyMergeName(company),
      })),
    [companies],
  );

  const conflicts = useMemo(
    () => buildMergeConflicts(rows, selection),
    [rows, selection],
  );

  const results = useMemo(
    () => buildMergeResults(rows, selection),
    [rows, selection],
  );

  const selectChoice = useCallback((key: string, choice: MergeChoice) => {
    setSelection((prev) => ({ ...prev, [key]: choice }));
  }, []);

  const getCompanyFields = useCallback(
    () => buildCompanyMergeFields(rows, selection),
    [rows, selection],
  );

  return { companyNames, conflicts, results, selectChoice, getCompanyFields };
};
