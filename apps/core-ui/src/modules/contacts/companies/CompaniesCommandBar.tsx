import type { Company } from '@erxes/core-contract';
import { LeadsBulkActions } from '~/modules/leads/LeadActions';
import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan, useSession } from '~/modules/auth/session';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { TagsSelect } from '~/modules/tags/TagsSelect';
import { companyTitle } from '../components/ContactPicker';
import { commonTagIds, MergeButton, tagChange } from '../components/MergeButton';
import { MergeDialog } from '../components/MergeDialog';
import { useCompaniesMerge, useCompaniesRemove, useCompaniesTag } from './useCompanies';

/** Actions on the selected rows, at the bottom of the screen (old core-ui). */
export const CompaniesCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { user } = useSession();
  const { confirm } = useConfirm();
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { openRecord } = useSidePanel();
  const remove = useCompaniesRemove();
  const tag = useCompaniesTag();
  const merge = useCompaniesMerge();
  const [merging, setMerging] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const companies = selectedRows.map((row) => row.original as Company);
  const companyIds = companies.map((company) => company.id);
  const tagIds = commonTagIds(companies);
  // Owners and admins merge and delete (core's rule).
  const manager = useCan()('contacts.merge');

  return (
    <>
      <CommandBar open={selectedRows.length > 0 && !merging}>
        <CommandBar.Bar>
          <CommandBar.Value>
            {t('selected', { selectedCount: selectedRows.length })}
          </CommandBar.Value>
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
                disabled={selectedRows.length !== 2}
                onClick={() => setMerging(true)}
              />
              <Separator.Inline />
              <Button
                variant="secondary"
                className="text-destructive"
                onClick={() =>
                  void confirm({
                    message: t('confirm-delete-selected', { count: companyIds.length }),
                  }).then(() =>
                    remove.mutate(
                      { ids: companyIds },
                      { onSuccess: () => table.setRowSelection({}) },
                    ),
                  )
                }
              >
                <IconTrash />
                {t('action-delete')}
              </Button>
            </>
          )}
        </CommandBar.Bar>
      </CommandBar>
      <MergeDialog
        open={merging}
        onOpenChange={setMerging}
        noun="companies"
        merging={merge.isPending}
        records={companies.map((company) => ({
          id: company.id,
          title: companyTitle(company) || 'Unnamed',
          details: [company.primaryEmail ?? '', company.website ?? ''],
        }))}
        onMerge={(keepId) =>
          merge.mutate(
            { ids: companyIds, keepId },
            {
              onSuccess: (company) => {
                setMerging(false);
                table.resetRowSelection(true);
                openRecord({ contentType: 'core:company', contentId: company.id });
              },
            },
          )
        }
      />
    </>
  );
};
