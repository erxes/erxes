import { ITriage } from '@/triage/types/triage';

export const TriageWidgets = ({ triage }: { triage: ITriage }) => {
  return <div>TriageWidgets {triage.name} </div>;
};
