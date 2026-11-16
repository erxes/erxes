import { useFormat, PanelField, PanelSection } from 'erxes-ui';
import type { LeadRecordType } from '@erxes/core-contract';
import { IconCalendarCheck, IconHourglass, IconWorld } from '@tabler/icons-react';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { pluginTitle, useInstalledPlugins } from '~/modules/products/useCatalogContext';
import { daysSince, type LeadRecord, useLeadStages } from './useLeads';
import { useLeadsT } from './i18n';

const Text = ({ children }: { children: React.ReactNode }) => (
  <span className="truncate px-2 text-sm">{children}</span>
);

/**
 * Where someone came from, in words: the app that added them by its title ("Ecommerce"), a
 * member or an import, or a source a caller named, with its details.
 */
const useSourceText = (record: LeadRecord) => {
  const t = useLeadsT();
  const { plugins } = useInstalledPlugins();
  const { source, sourceDetails } = record;

  if (source === 'plugin') {
    return sourceDetails.plugin ? pluginTitle(plugins, sourceDetails.plugin) : t('source-plugin');
  }

  if (source === 'manual') return t('source-manual');

  if (source === 'import') return t('source-import');

  const details = Object.values(sourceDetails).filter(Boolean);

  return [source, ...details].join(' · ');
};

/** A lead's stage and time in it, and anyone's source and conversion date. */
export const LeadPanelSection = ({
  record,
}: {
  recordType: LeadRecordType;
  record: LeadRecord;
}) => {
  const { byId } = useLeadStages();
  const t = useLeadsT();
  const fmt = useFormat();
  const isLead = record.state === 'lead';
  const stage = record.leadStageId ? byId.get(record.leadStageId) : null;
  const days = daysSince(record.leadStageChangedAt, useMinuteClock());
  const sourceText = useSourceText(record);

  if (!isLead && !record.source && !record.convertedAt) return null;

  // The stage and Convert sit in the record's header; here, the details.
  return (
    <PanelSection title={isLead ? t('lead') : t('origin')} nested>
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
            <span className="first-letter:uppercase">{sourceText}</span>
          </Text>
        </PanelField>
      )}
      {record.convertedAt && (
        <PanelField icon={IconCalendarCheck} label={t('became-customer')}>
          <Text>{fmt.date(record.convertedAt)}</Text>
        </PanelField>
      )}
    </PanelSection>
  );
};
