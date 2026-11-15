import { hostComponent } from './host-component';

/** Which record `RecordTimeline` shows: its timeline type and id. */
export type RecordTimelineProps = { type: string; id: string };

const timeline = hostComponent<RecordTimelineProps>();

/** Registers core's timeline; web calls it at startup and plugins don't. */
export const setRecordTimeline = timeline.set;

/**
 * Core's timeline of notes, calls and events for a plugin's record.
 * `<RecordTimeline type="hr.employee" id={employee.id} />` shows notes, mentions, pins,
 * reactions, logged calls and the plugin's own entries. The type must be in the plugin's
 * manifest `timelines`. The host app (web) registers the component; outside erxes it renders
 * nothing.
 */
export const RecordTimeline = timeline.Host;
