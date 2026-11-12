import type { LeadRecordType } from '@erxes/core-contract';
import { IconArrowRight, IconBuilding, IconCircleX, IconUserCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Combobox, Dialog, Label, Popover, RecordTable, Spinner, Textarea } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { api } from '~/lib/api';
import { SelectContactContent } from '~/modules/contacts/components/ContactPicker';
import { SelectMember } from '~/modules/contacts/components/SelectMember';
import { LeadStageMenu } from './LeadStageBadge';
import {
  firstOfKind,
  type LeadRecord,
  useConvertLeads,
  useLeadStages,
  useMoveLeads,
} from './useLeads';
import { useLeadsT, useStageName } from './i18n';

/** Common reasons, one click away; anything else can be typed. */
const REASONS = ['budget', 'fit', 'response', 'competitor', 'timing', 'duplicate'] as const;

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
  const t = useLeadsT();
  const stageName = useStageName();
  const move = useMoveLeads();
  const { byId } = useLeadStages();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (stageId) setReason('');
  }, [stageId]);

  const submit = () =>
    move.mutate(
      {
        recordType,
        ids,
        stageId: stageId!,
        reason: reason.trim() || undefined,
      },
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
          <Dialog.Title>
            {ids.length === 1
              ? t('actions.disqualify-one')
              : t('actions.disqualify-many', { count: ids.length })}
          </Dialog.Title>
          <Dialog.Description>
            {t('actions.disqualify-description', {
              stage: stageId ? stageName(byId.get(stageId)?.name) : '',
            })}
          </Dialog.Description>
        </Dialog.Header>
        <div className="flex flex-wrap gap-1.5">
          {REASONS.map((key) => {
            const item = t(`actions.reasons.${key}`);

            return (
              <Button
                key={key}
                size="sm"
                variant={reason === item ? 'default' : 'outline'}
                onClick={() => setReason(item)}
              >
                {item}
              </Button>
            );
          })}
        </div>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t('actions.reason-placeholder')}
          maxLength={500}
        />
        <Dialog.Footer>
          <Button variant="outline" onClick={onClose} disabled={move.isPending}>
            {t('actions.cancel')}
          </Button>
          <Button variant="destructive" onClick={submit} disabled={move.isPending}>
            {move.isPending ? <Spinner size="sm" /> : <IconCircleX />}
            {t('actions.disqualify')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

const CompanyName = ({ id }: { id: string }) => {
  const company = useQuery({
    queryKey: ['companies', 'detail', id],
    queryFn: () => api.companies.get({ id }),
  });

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
  const t = useLeadsT();
  const convert = useConvertLeads();
  const [ownerId, setOwnerId] = useState<string | undefined>();
  const [companyId, setCompanyId] = useState<string | undefined>();
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setOwnerId(leads.length === 1 ? (leads[0].ownerId ?? undefined) : undefined);
      setCompanyId(undefined);
    }
  }, [open, leads]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {leads.length === 1
              ? t('actions.convert-one')
              : t('actions.convert-many', { count: leads.length })}
          </Dialog.Title>
          <Dialog.Description>
            {t('actions.convert-description', {
              list: recordType === 'company' ? t('companies') : t('actions.customers'),
            })}
          </Dialog.Description>
        </Dialog.Header>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>{t('actions.owner')}</Label>
            <SelectMember.Provider
              value={ownerId}
              onValueChange={(next) => setOwnerId(typeof next === 'string' ? next : undefined)}
              setOpen={setOwnerOpen}
            >
              <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
                <Combobox.Trigger className="w-full shadow-xs">
                  <SelectMember.Value
                    placeholder={
                      leads.length === 1 ? t('actions.keep-owner') : t('actions.keep-owners')
                    }
                  />
                </Combobox.Trigger>
                <Combobox.Content>
                  <SelectMember.Content />
                </Combobox.Content>
              </Popover>
            </SelectMember.Provider>
          </div>
          {recordType === 'customer' && (
            <div className="flex flex-col gap-1.5">
              <Label>{t('actions.company')}</Label>
              <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                <Combobox.Trigger className="w-full shadow-xs">
                  <span className="flex min-w-0 items-center gap-2">
                    <IconBuilding className="size-4 shrink-0 text-muted-foreground" />
                    {companyId ? (
                      <CompanyName id={companyId} />
                    ) : (
                      <span className="text-muted-foreground">{t('actions.none')}</span>
                    )}
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={convert.isPending}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            disabled={convert.isPending}
            onClick={() =>
              convert.mutate(
                {
                  recordType,
                  ids: leads.map((lead) => lead.id),
                  ownerId,
                  companyId: recordType === 'customer' ? companyId : undefined,
                },
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
            {t('actions.convert')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

/** The command bar's lead actions on the selected rows: move, convert, disqualify. */
export const LeadsBulkActions = ({
  recordType,
  leads,
}: {
  recordType: LeadRecordType;
  leads: LeadRecord[];
}) => {
  const t = useLeadsT();
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
        value={leads.length === 1 ? leads[0].leadStageId : null}
        align="end"
        onSelect={(stage) =>
          stage.kind === 'disqualified'
            ? setDisqualifying(stage.id)
            : move.mutate({ recordType, ids, stageId: stage.id }, { onSuccess: clear })
        }
      >
        <Button variant="secondary">
          <IconArrowRight />
          {t('actions.move-to')}
        </Button>
      </LeadStageMenu>
      <Button variant="secondary" onClick={() => setConverting(true)}>
        <IconUserCheck />
        {t('actions.convert')}
      </Button>
      {lost && (
        <Button variant="secondary" onClick={() => setDisqualifying(lost.id)}>
          <IconCircleX />
          {t('actions.disqualify')}
        </Button>
      )}
      <ConvertDialog
        recordType={recordType}
        leads={leads}
        open={converting}
        onOpenChange={setConverting}
        onDone={clear}
      />
      <DisqualifyDialog
        recordType={recordType}
        ids={ids}
        stageId={disqualifying}
        onClose={() => setDisqualifying(null)}
        onDone={clear}
      />
    </>
  );
};
