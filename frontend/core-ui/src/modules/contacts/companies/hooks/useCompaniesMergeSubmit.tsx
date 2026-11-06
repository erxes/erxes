import { useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { RecordTable, useToast } from 'erxes-ui';
import { useMergeCompanies } from '@/contacts/companies/hooks/useMergeCompanies';
import { CompanyFields } from '@/contacts/companies/utils/companyMerge';

interface UseCompaniesMergeSubmitProps {
  companyIds: string[];
  getCompanyFields: () => CompanyFields;
  onMerged: () => void;
}

/** Saves the merge, then clears the table selection and reports the result. */
export const useCompaniesMergeSubmit = ({
  companyIds,
  getCompanyFields,
  onMerged,
}: UseCompaniesMergeSubmitProps) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();
  const { mergeCompanies, loading } = useMergeCompanies();

  const save = useCallback(() => {
    mergeCompanies({
      variables: { companyIds, companyFields: getCompanyFields() },
      onError: (e: ApolloError) => {
        toast({
          title: t('error-title'),
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        onMerged();
        table.setRowSelection({});
        toast({
          title: t('success-title'),
          description: t('merged-success'),
          variant: 'success',
        });
      },
    });
  }, [companyIds, getCompanyFields, mergeCompanies, onMerged, t, table, toast]);

  return { save, saving: loading };
};
