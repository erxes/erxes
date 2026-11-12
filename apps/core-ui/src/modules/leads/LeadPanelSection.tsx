import type { LeadRecordType } from '@erxes/core-contract';
import { IconCalendarCheck, IconHourglass, IconProgress, IconUserCheck, IconWorld } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { PanelField } from '~/modules/side-panel/PanelField';
import { ContactDetailSection } from '~/modules/side-panel/details/ContactDetailSection';
import { ConvertDialog, DisqualifyDialog } from './LeadActions';
import { LeadStageMenu, LeadStageTrigger } from './LeadStageBadge';
import { daysSince, type LeadRecord, useLeadStages, useMoveLeads } from './useLeads';

const Text = ({ children }: { children: React.ReactNode }) => <span className="truncate px-2 text-sm">{children}</span>;

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

/** A lead's stage (movable), time in it, source, and Convert; a customer's source and when it converted. */
export const LeadPanelSection = ({ recordType, record: customer }: { recordType: LeadRecordType; record: LeadRecord }) => {
  const { stages, byId } = useLeadStages();
  const move = useMoveLeads();
  const [converting, setConverting] = useState(false);
  const [disqualifying, setDisqualifying] = useState<string | null>(null);
  const isLead = customer.state === 'lead';
  const stage = customer.leadStageId ? byId.get(customer.leadStageId) : null;
  const days = daysSince(customer.leadStageChangedAt);
  const details = Object.entries(customer.sourceDetails);

  if (!isLead && !customer.source && !customer.convertedAt) return null;

  return (
    <ContactDetailSection title={isLead ? 'Lead' : 'Origin'} nested>
      {isLead && (
        <>
          <PanelField icon={IconProgress} label="Stage">
            <LeadStageMenu
              stages={stages}
              value={customer.leadStageId}
              onSelect={(next) => (next.kind === 'disqualified' ? setDisqualifying(next.id) : move.mutate({ recordType, ids: [customer.id], stageId: next.id }))}
            >
              <LeadStageTrigger stage={stage} />
            </LeadStageMenu>
          </PanelField>
          {days !== null && (
            <PanelField icon={IconHourglass} label="In stage">
              <Text>
                {days === 0 ? 'Since today' : `${days} days`}
                {stage?.kind === 'disqualified' && customer.disqualifyReason ? ` · ${customer.disqualifyReason}` : ''}
              </Text>
            </PanelField>
          )}
        </>
      )}
      {customer.source && (
        <PanelField icon={IconWorld} label="Source">
          <Text>
            <span className="capitalize">{customer.source}</span>
            {details.length > 0 && <span className="text-muted-foreground"> · {details.map(([key, value]) => `${key}: ${value}`).join(', ')}</span>}
          </Text>
        </PanelField>
      )}
      {customer.convertedAt && (
        <PanelField icon={IconCalendarCheck} label="Became a customer">
          <Text>{day(customer.convertedAt)}</Text>
        </PanelField>
      )}
      {isLead && (
        <div className="px-1 py-2">
          <Button size="sm" className="w-full" onClick={() => setConverting(true)}>
            <IconUserCheck />
            Convert to customer
          </Button>
        </div>
      )}
      <ConvertDialog recordType={recordType} leads={[customer]} open={converting} onOpenChange={setConverting} />
      <DisqualifyDialog recordType={recordType} ids={[customer.id]} stageId={disqualifying} onClose={() => setDisqualifying(null)} />
    </ContactDetailSection>
  );
};
