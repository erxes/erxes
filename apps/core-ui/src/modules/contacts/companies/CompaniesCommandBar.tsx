import type { Company } from '@erxes/core-contract';
import { IconArrowMerge, IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator, useConfirm, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useSession } from '~/modules/auth/session';
import { BulkTagButton } from '~/modules/tags/BulkTagButton';
import { MergeDialog } from '../components/MergeDialog';
import { COMPANY_SHEET_PARAM, useCompaniesMerge, useCompaniesRemove, useCompaniesTag } from './useCompanies';

export const CompaniesCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { user } = useSession();
  const { confirm } = useConfirm();
  const remove = useCompaniesRemove();
  const tag = useCompaniesTag();
  const merge = useCompaniesMerge();
  const [, setOpenId] = useQueryState<string>(COMPANY_SHEET_PARAM);
  const [merging, setMerging] = useState(false);
  const rows = table.getFilteredSelectedRowModel().rows;
  const companies = rows.map((row) => row.original as Company);
  const ids = companies.map((company) => company.id);

  const done = () => table.resetRowSelection();

  return (
    <>
      <CommandBar open={rows.length > 0 && !merging}>
        <CommandBar.Bar>
          <CommandBar.Value onClose={done}>{rows.length} selected</CommandBar.Value>
          <Separator.Inline />
          <BulkTagButton type="company" records={companies} onChange={(change) => tag.mutate({ ids, ...change })} />
          {user.role !== 'member' && (
            <>
              <Button variant="secondary" disabled={rows.length < 2 || rows.length > 10} onClick={() => setMerging(true)}>
                <IconArrowMerge />
                Merge
              </Button>
              <Separator.Inline />
              <Button
                variant="secondary"
                className="text-destructive"
                onClick={() =>
                  confirm({
                    message: `Delete ${rows.length} selected?`,
                    options: { okLabel: 'Delete', variants: { ok: 'destructive' } },
                  }).then(() => remove.mutate(ids, { onSuccess: done }))
                }
              >
                <IconTrash />
                Delete
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
          title: company.primaryName,
          details: [company.website ?? '', company.primaryEmail ?? '', company.primaryPhone ?? ''],
        }))}
        onMerge={(keepId) =>
          merge.mutate(
            { ids, keepId },
            {
              onSuccess: (company) => {
                setMerging(false);
                done();
                setOpenId(company.id);
              },
            },
          )
        }
      />
    </>
  );
};
