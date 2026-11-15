import { hostComponent } from './host-component';

/**
 * Core's timeline, for plugin UIs: `<RecordTimeline type="hr.employee" id={employee.id} />`
 * shows notes, mentions, pins, reactions, logged calls and the plugin's own
 * entries for one of its records (the type must be in the plugin's manifest
 * `timelines`). The host app (web) registers the component.
 */
export type RecordTimelineProps = { type: string; id: string };

const timeline = hostComponent<RecordTimelineProps>();

export const setRecordTimeline = timeline.set;

export const RecordTimeline = timeline.Host;
