import type { LeadRecordType } from '@erxes/core-contract';
import { IconArrowRight, IconBuilding, IconCircleX, IconUserCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Combobox, Dialog, Label, Popover, RecordTable, Spinner, Textarea } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { api } from '~/lib/api';
import { SelectContactContent } from '~/modules/contacts/components/ContactPicker';
import { SelectMember } from '~/modules/contacts/components/SelectMember';
import { LeadStageMenu } from './LeadStageBadge';
import { firstOfKind, type LeadRecord, useConvertLeads, useLeadStages, useMoveLeads } from './useLeads';

/** Common reasons, one click away; anything else can be typed. */
const REASONS = ['No budget', 'Not a fit', 'No response', 'Chose a competitor', 'Bad timing', 'Duplicate'];

/** Asks why, then moves the leads to the disqualified stage `stageId` (closed while it is null). */
export const DisqualifyDialog = ({
  recordType,
  ids,
  stageId,
  onClose,
  onDone,
}: {
  recordType: LeadRecordType;
  ids: string[];
  stageId: string | null;
  onClose: () => void;
  onDone?: () => void;
}) => {
  const move = useMoveLeads();
  const { byId } = useLeadStages();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (stageId) setReason('');
  }, [stageId]);

  const submit = () =>
    move.mutate(
      { recordType, ids, stageId: stageId!, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          onClose();
          onDone?.();
        },
      },
    );

  return (
    <Dialog open={Boolean(stageId)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{ids.length === 1 ? 'Disqualify the lead' : `Disqualify ${ids.length} leads`}</Dialog.Title>
          <Dialog.Description>
            {`They move to “${stageId ? (byId.get(stageId)?.name ?? '') : ''}”. The reason shows in the lead report.`}
          </Dialog.Description>
        </Dialog.Header>
        <div className="flex flex-wrap gap-1.5">
          {REASONS.map((item) => (
            <Button key={item} size="sm" variant={reason === item ? 'default' : 'outline'} onClick={() => setReason(item)}>
              {item}
            </Button>
          ))}
        </div>
        <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Or write the reason" maxLength={500} />
        <Dialog.Footer>
          <Button variant="outline" onClick={onClose} disabled={move.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit} disabled={move.isPending}>
            {move.isPending ? <Spinner size="sm" /> : <IconCircleX />}
            Disqualify
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

const CompanyName = ({ id }: { id: string }) => {
  const company = useQuery({ queryKey: ['companies', 'detail', id], queryFn: () => api.companies.get({ id }) });

  return <span className="truncate">{company.data?.primaryName ?? '…'}</span>;
};

/** Makes leads customers: who owns them from now on, and the company they belong to (both optional). */
export const ConvertDialog = ({
  recordType,
  leads,
  open,
  onOpenChange,
  onDone,
}: {
  recordType: LeadRecordType;
  leads: LeadRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone?: () => void;
}) => {
  const convert = useConvertLeads();
  const [ownerId, setOwnerId] = useState<string | undefined>();
  const [companyId, setCompanyId] = useState<string | undefined>();
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setOwnerId(leads.length === 1 ? (leads[0]!.ownerId ?? undefined) : undefined);
      setCompanyId(undefined);
    }
  }, [open, leads]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{leads.length === 1 ? 'Convert to a customer' : `Convert ${leads.length} leads to customers`}</Dialog.Title>
          <Dialog.Description>
            {`They leave Leads and join ${recordType === 'company' ? 'Companies' : 'Customers'}. Their history, stage and source stay for reports.`}
          </Dialog.Description>
        </Dialog.Header>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Owner</Label>
            <SelectMember.Provider value={ownerId} onValueChange={(next) => setOwnerId(typeof next === 'string' ? next : undefined)} setOpen={setOwnerOpen}>
              <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
                <Combobox.Trigger className="w-full shadow-xs">
                  <SelectMember.Value placeholder={leads.length === 1 ? 'Keep as is' : 'Keep each one’s owner'} />
                </Combobox.Trigger>
                <Combobox.Content>
                  <SelectMember.Content />
                </Combobox.Content>
              </Popover>
            </SelectMember.Provider>
          </div>
          {recordType === 'customer' && (
          <div className="flex flex-col gap-1.5">
            <Label>Company</Label>
            <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
              <Combobox.Trigger className="w-full shadow-xs">
                <span className="flex min-w-0 items-center gap-2">
                  <IconBuilding className="size-4 shrink-0 text-muted-foreground" />
                  {companyId ? <CompanyName id={companyId} /> : <span className="text-muted-foreground">None</span>}
                </span>
              </Combobox.Trigger>
              <Combobox.Content>
                <SelectContactContent
                  kind="company"
                  value={companyId ? [companyId] : []}
                  onValueChange={(ids) => {
                    setCompanyId(ids.filter((id) => id !== companyId).at(-1));
                    setCompanyOpen(false);
                  }}
                />
              </Combobox.Content>
            </Popover>
          </div>
          )}
        </div>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={convert.isPending}>
            Cancel
          </Button>
          <Button
            disabled={convert.isPending}
            onClick={() =>
              convert.mutate(
                { recordType, ids: leads.map((lead) => lead.id), ownerId, companyId: recordType === 'customer' ? companyId : undefined },
                {
                  onSuccess: () => {
                    onOpenChange(false);
                    onDone?.();
                  },
                },
              )
            }
          >
            {convert.isPending ? <Spinner size="sm" /> : <IconUserCheck />}
            Convert
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

/** The command bar's lead actions on the selected rows: move, convert, disqualify. */
export const LeadsBulkActions = ({ recordType, leads }: { recordType: LeadRecordType; leads: LeadRecord[] }) => {
  const { table } = RecordTable.useRecordTable();
  const { stages } = useLeadStages();
  const move = useMoveLeads();
  const [converting, setConverting] = useState(false);
  const [disqualifying, setDisqualifying] = useState<string | null>(null);
  const ids = leads.map((lead) => lead.id);
  const clear = () => table.setRowSelection({});
  const lost = firstOfKind(stages, 'disqualified');

  return (
    <>
      <LeadStageMenu
        stages={stages}
        value={leads.length === 1 ? leads[0]!.leadStageId : null}
        align="end"
        onSelect={(stage) => (stage.kind === 'disqualified' ? setDisqualifying(stage.id) : move.mutate({ recordType, ids, stageId: stage.id }, { onSuccess: clear }))}
      >
        <Button variant="secondary">
          <IconArrowRight />
          Move to
        </Button>
      </LeadStageMenu>
      <Button variant="secondary" onClick={() => setConverting(true)}>
        <IconUserCheck />
        Convert
      </Button>
      {lost && (
        <Button variant="secondary" onClick={() => setDisqualifying(lost.id)}>
          <IconCircleX />
          Disqualify
        </Button>
      )}
      <ConvertDialog recordType={recordType} leads={leads} open={converting} onOpenChange={setConverting} onDone={clear} />
      <DisqualifyDialog recordType={recordType} ids={ids} stageId={disqualifying} onClose={() => setDisqualifying(null)} onDone={clear} />
    </>
  );
};
