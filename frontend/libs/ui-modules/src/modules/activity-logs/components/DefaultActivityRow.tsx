import { TActivityLog } from '../types';
import { DefaultActivitySentence } from './DefaultActivitySentence';

export function DefaultActivityRow({ activity }: { activity: TActivityLog }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm text-foreground flex flex-row gap-1 flex-wrap items-center">
        <DefaultActivitySentence activity={activity} />
      </div>
    </div>
  );
}
