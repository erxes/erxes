import type { RecordTimelineProps } from 'erxes-ui';
import { ActivityTimeline } from './ActivityTimeline';

/** Core's timeline as plugin UIs embed it (through erxes-ui's `RecordTimeline`). */
export const SharedTimeline = ({ type, id }: RecordTimelineProps) => (
  <div className="flex min-h-0 flex-1 flex-col">
    <ActivityTimeline targetType={type} targetId={id} />
  </div>
);
