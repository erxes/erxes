import { ITriage } from '@/triage/types/triage';

export const TriageWidgetCard = ({ triage }: { triage: ITriage }) => {
  return <div>TriageWidgetCard {triage.name} </div>;
};
