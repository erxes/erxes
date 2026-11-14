import type { Company } from '@erxes/core-contract';
import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectedRows } from '~/components/useSelectedRows';
import { useCan } from '~/modules/auth/session';
import { LeadsBulkActions } from '~/modules/leads/LeadActions';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { TagsSelect } from '~/modules/tags/TagsSelect';
import { companyTitle } from '../components/ContactPicker';
import { commonTagIds, MergeButton, tagChange } from '../components/MergeButton';
import { MergeDialog } from '../components/MergeDialog';
import { useCompaniesMerge, useCompaniesRemove, useCompaniesTag } from './useCompanies';

/** Merges the two selected companies into the one kept, then opens it. */
const CompaniesMergeDialog = ({
  companies,
  open,
  onOpenChange,
}: {
  companies: Company[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { table } = RecordTable.useRecordTable();
  const { openRecord } = useSidePanel();
  const merge = useCompaniesMerge();

  return (
    <MergeDialog
      open={open}
      onOpenChange={onOpenChange}
      noun="companies"
      merging={merge.isPending}
      records={companies.map((company) => ({
        id: company.id,
        title: companyTitle(company) || 'Unnamed',
        details: [company.primaryEmail ?? '', company.website ?? ''],
      }))}
      onMerge={(keepId) =>
        merge.mutate(
          { ids: companies.map((company) => company.id), keepId },
          {
            onSuccess: (company) => {
              onOpenChange(false);
              table.resetRowSelection(true);
              openRecord({ contentType: 'core:company', contentId: company.id });
            },
          },
        )
      }
    />
  );
};

/** Actions on the selected rows, at the bottom of the screen. */
export const CompaniesCommandBar = ({ rows }: { rows: Company[] }) => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const remove = useCompaniesRemove();
  const tag = useCompaniesTag();
  const [merging, setMerging] = useState(false);
  const companies = useSelectedRows(rows);
  const companyIds = companies.map((company) => company.id);
  const tagIds = commonTagIds(companies);
  // Owners and admins merge and delete (core's rule).
  const manager = useCan()('contacts.merge');

  const deleteSelected = () =>
    void confirm({
      message: t('confirm-delete-selected', { count: companyIds.length }),
    }).then(() =>
      remove.mutate({ ids: companyIds }, { onSuccess: () => table.setRowSelection({}) }),
    );

  return (
    <>
      <CommandBar open={companies.length > 0 && !merging}>
        <CommandBar.Bar>
          <CommandBar.Value>{t('selected', { selectedCount: companies.length })}</CommandBar.Value>
          <Separator.Inline />
          <TagsSelect
            type="company"
            mode="multiple"
            variant="secondary"
            className="shadow-none"
            value={tagIds}
            onValueChange={(next) => tag.mutate({ ids: companyIds, ...tagChange(tagIds, next) })}
          />
          {companies.every((company) => company.state === 'lead') && (
            <>
              <Separator.Inline />
              <LeadsBulkActions recordType="company" leads={companies} />
            </>
          )}
          {manager && (
            <>
              <Separator.Inline />
              <MergeButton
                label={t('action-merge')}
                tooltip={t('merge-tooltip')}
                disabled={companies.length !== 2}
                onClick={() => setMerging(true)}
              />
              <Separator.Inline />
              <Button variant="secondary" tone="destructive" onClick={deleteSelected}>
                <IconTrash />
                {t('action-delete')}
              </Button>
            </>
          )}
        </CommandBar.Bar>
      </CommandBar>
      <CompaniesMergeDialog companies={companies} open={merging} onOpenChange={setMerging} />
    </>
  );
};
