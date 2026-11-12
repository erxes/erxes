import type { LeadRecordType } from '@erxes/core-contract';
import { IconCalendarCheck, IconHourglass, IconWorld } from '@tabler/icons-react';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { PanelField } from '~/modules/side-panel/PanelField';
import { ContactDetailSection } from '~/modules/side-panel/details/ContactDetailSection';
import { daysSince, type LeadRecord, useLeadStages } from './useLeads';
import { useLeadsT } from './i18n';

const Text = ({ children }: { children: React.ReactNode }) => (
  <span className="truncate px-2 text-sm">{children}</span>
);

const day = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/** A lead's stage and time in it, and anyone's source and conversion date. */
export const LeadPanelSection = ({
  record,
}: {
  recordType: LeadRecordType;
  record: LeadRecord;
}) => {
  const { byId } = useLeadStages();
  const t = useLeadsT();
  const isLead = record.state === 'lead';
  const stage = record.leadStageId ? byId.get(record.leadStageId) : null;
  const days = daysSince(record.leadStageChangedAt, useMinuteClock());
  const details = Object.entries(record.sourceDetails);

  if (!isLead && !record.source && !record.convertedAt) return null;

  // The stage and Convert sit in the record's header; here, the details.
  return (
    <ContactDetailSection title={isLead ? t('lead') : t('origin')} nested>
      {isLead && days !== null && (
        <PanelField icon={IconHourglass} label={t('in-stage')}>
          <Text>
            {days === 0 ? t('since-today') : t('days-count', { count: days })}
            {stage?.kind === 'disqualified' && record.disqualifyReason
              ? ` · ${record.disqualifyReason}`
              : ''}
          </Text>
        </PanelField>
      )}
      {record.source && (
        <PanelField icon={IconWorld} label={t('source')}>
          <Text>
            <span className="capitalize">{record.source}</span>
            {details.length > 0 && (
              <span className="text-muted-foreground">
                {' '}
                · {details.map(([key, value]) => `${key}: ${value}`).join(', ')}
              </span>
            )}
          </Text>
        </PanelField>
      )}
      {record.convertedAt && (
        <PanelField icon={IconCalendarCheck} label={t('became-customer')}>
          <Text>{day(record.convertedAt)}</Text>
        </PanelField>
      )}
    </ContactDetailSection>
  );
};
