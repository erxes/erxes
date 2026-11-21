import type { Activity } from '@erxes/core-contract';
import { ChangeList, type Lookups } from '~/components/ChangeList';
import { ChangeLines } from '~/modules/dataExtensions/history/ChangeLines';
import { readChanges, readDataChanges } from './activityData';

/** What a core entry changed: a record's fields, or its Data Extensions values. */
export const EntryChanges = ({ activity, lookups }: { activity: Activity; lookups: Lookups }) => {
  if (activity.source !== 'core') return null;

  const values = readDataChanges(activity);

  if (values) return <ChangeLines changes={values} className="mt-1.5" />;

  const changes = readChanges(activity);

  return changes ? <ChangeList changes={changes} lookups={lookups} className="mt-1.5" /> : null;
};
