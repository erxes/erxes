import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { ApolloError, useQuery } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { ChoiceboxGroup, Spinner, useToast } from 'erxes-ui';
import { CompaniesMergeSheet } from '@/contacts/companies/components/companies-command-bar/CompaniesMergeSheet';
import { GET_COMPANIES_FOR_MERGE } from '@/contacts/companies/graphql/queries/getCompaniesForMerge';
import { useMergeCompanies } from '@/contacts/companies/hooks/useMergeCompanies';
import { MergingFieldContainer } from '@/contacts/customers/components/customers-command-bar/merge/MergingFieldContainer';
import { TCompany } from '@/contacts/types/companyType';
import {
  MergeCompany,
  MergeSelection,
  buildCompanyMergeFields,
  buildMergeRows,
  isEmpty,
  resolveMergeValue,
} from '@/contacts/companies/utils/companyMerge';

interface CompaniesMergeProps {
  rows: Row<TCompany>[];
}

export const CompaniesMerge = ({ rows }: CompaniesMergeProps) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<MergeSelection>({});

  const companyIds = rows.map((row) => row.original._id);
  const companyIdsKey = companyIds.join(',');
  const disabled = companyIds.length !== 2;

  const { data, loading } = useQuery<{ companies: { list: MergeCompany[] } }>(
    GET_COMPANIES_FOR_MERGE,
    {
      variables: { ids: companyIds, limit: 2 },
      skip: disabled || !open,
      fetchPolicy: 'network-only',
    },
  );
  const { mergeCompanies, loading: merging } = useMergeCompanies();

  useEffect(() => {
    setSelection({});
  }, [companyIdsKey]);

  // Keep the order the user selected the rows in.
  const companies = useMemo(() => {
    const list = data?.companies?.list || [];
    const ordered = companyIdsKey
      .split(',')
      .map((id) => list.find((company) => company._id === id))
      .filter(Boolean) as MergeCompany[];
    return ordered.length === 2
      ? (ordered as [MergeCompany, MergeCompany])
      : null;
  }, [data, companyIdsKey]);

  const mergeRows = useMemo(
    () => (companies ? buildMergeRows(companies) : []),
    [companies],
  );
  const conflictRows = mergeRows.filter((row) => row.conflict);

  const handleSave = () => {
    if (!companies) return;

    const companyFields = buildCompanyMergeFields(mergeRows, selection);

    mergeCompanies({
      variables: { companyIds, companyFields },
      onError: (e: ApolloError) => {
        toast({
          title: t('error-title'),
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        setOpen(false);
        rows.forEach((row) => row.toggleSelected(false));
        toast({
          title: t('success-title'),
          description: t('merged-success'),
          variant: 'success',
        });
      },
    });
  };

  if (disabled) return <CompaniesMergeSheet disabled />;

  return (
    <CompaniesMergeSheet
      className="p-6 flex gap-2 items-start"
      open={open}
      onOpenChange={setOpen}
      onDiscard={() => setOpen(false)}
      onSave={handleSave}
      saving={merging}
      saveDisabled={!companies}
    >
      {loading || !companies ? (
        <div className="flex w-full justify-center py-10">
          {loading ? <Spinner /> : null}
        </div>
      ) : (
        <>
          <div className="flex-2 flex flex-col gap-2">
            <div className="flex justify-between gap-2 mb-1">
              {companies.map((company) => (
                <span
                  key={company._id}
                  className="text-sm font-semibold text-muted-foreground w-full"
                >
                  {company.primaryName || company.primaryEmail || company._id}
                </span>
              ))}
            </div>
            {conflictRows.length === 0 && (
              <span className="text-sm text-muted-foreground">
                {t('merge-no-conflicts')}
              </span>
            )}
            {conflictRows.map(({ field, values }) => (
              <ChoiceboxGroup
                key={field.key}
                value={selection[field.key] ?? '0'}
                onValueChange={(selected) =>
                  setSelection((prev) => ({
                    ...prev,
                    [field.key]: selected as '0' | '1',
                  }))
                }
                direction="row"
                className="gap-3"
              >
                {values.map((value, index) => (
                  <MergingFieldContainer
                    key={`${field.key}-${index}`}
                    fieldName={field.label}
                    fieldValue={value}
                    type={field.type}
                    value={String(index)}
                  />
                ))}
              </ChoiceboxGroup>
            ))}
          </div>

          <div className="flex-[1.2] ml-5 flex flex-col gap-2">
            <span className="text-sm font-semibold text-primary mb-1">
              {t('merge-result')}
            </span>
            {mergeRows.map((row) => {
              const value = resolveMergeValue(row, selection[row.field.key]);
              if (isEmpty(value)) return null;
              return (
                <ChoiceboxGroup
                  key={row.field.key}
                  className="flex flex-col gap-2"
                >
                  <MergingFieldContainer
                    fieldName={row.field.label}
                    fieldValue={value}
                    type={row.field.type}
                    value={row.field.key}
                    disabled
                  />
                </ChoiceboxGroup>
              );
            })}
          </div>
        </>
      )}
    </CompaniesMergeSheet>
  );
};
