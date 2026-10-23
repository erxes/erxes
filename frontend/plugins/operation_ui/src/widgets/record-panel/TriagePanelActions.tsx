import { ConvertToTask } from '@/triage/components/triage-selects/ConvertToTask';
import { DeclineTriage } from '@/triage/components/triage-selects/DeclineTriage';

// A triage's actions in the side panel's top bar. Accepting (or declining)
// turns it into a task, which keeps its customers and companies and opens
// in its place.
export const TriagePanelActions = ({ triageId }: { triageId: string }) => (
  <>
    <DeclineTriage triageId={triageId} size="sm" />
    <ConvertToTask triageId={triageId} size="sm" />
  </>
);
