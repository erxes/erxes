import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import {
  TTriageDraft,
  useCreateTriageRecord,
} from '@/triage/hooks/useCreateTriageRecord';
import { useTranslation } from 'react-i18next';
import { PanelDraftFields, useSidePanelDraft } from 'ui-modules';
import { DraftContext } from './DraftContext';

// A triage not created yet: created once named, in the draft's team and
// for its contacts.
export const TriagePanelNew = () => {
  const { t } = useTranslation('operation');
  const draft = useSidePanelDraft<TTriageDraft>(TRIAGE_CONTENT_TYPE);
  const { createTriageRecord, loading } = useCreateTriageRecord();

  return (
    <PanelDraftFields
      scope="side-panel-triage-new"
      creating={loading}
      fields={[{ name: 'name', label: t('name', 'Name') }]}
      onCreate={({ name }) => name && createTriageRecord({ ...draft, name })}
    >
      <DraftContext
        teamId={draft.teamId}
        customerIds={draft.customerIds}
        companyIds={draft.companyIds}
      />
    </PanelDraftFields>
  );
};
