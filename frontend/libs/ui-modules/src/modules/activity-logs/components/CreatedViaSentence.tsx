import { Link } from 'react-router-dom';
import { TActivityLog } from '../types';
import { ActivityLogActorName } from './ActivityLogActor';

/**
 * Where a record came from, when nobody typed it in.
 *
 * The link is built from the source rather than looked up, so the sentence
 * costs no request in a feed. The name is the one the source carried when the
 * record was made: renaming a campaign afterwards must not rewrite what
 * already happened.
 */
const LINK_BY_SOURCE: Record<string, (sourceId: string) => string> = {
  broadcast: (sourceId) => `/broadcasts?messageId=${sourceId}`,
  automation: (sourceId) => `/automations/edit/${sourceId}`,
};

const LABEL_BY_SOURCE: Record<string, string> = {
  broadcast: 'campaign',
  automation: 'automation',
};

export const isCreatedViaActivity = (activity: TActivityLog) =>
  !!activity?.context?.data?.sourceId && !!activity?.contextType;

/**
 * The "from campaign X" half, for rows that already say what happened.
 *
 * Renders nothing for a record someone made by hand, so a module can add it
 * to its own sentence without asking whether there is anything to add.
 */
export function CreatedViaSuffix({ activity }: { activity: TActivityLog }) {
  const { contextType, context } = activity || {};

  if (!isCreatedViaActivity(activity)) {
    return null;
  }

  const sourceId = context?.data?.sourceId as string;
  const kind = LABEL_BY_SOURCE[contextType] || contextType;
  const name = context?.text || kind;
  const to = LINK_BY_SOURCE[contextType]?.(sourceId);

  return (
    <>
      <span className="text-muted-foreground">from {kind}</span>
      {to ? (
        <Link to={to} className="font-medium hover:underline">
          {name}
        </Link>
      ) : (
        <span className="font-medium">{name}</span>
      )}
    </>
  );
}

export function CreatedViaSentence({ activity }: { activity: TActivityLog }) {
  return (
    <>
      <ActivityLogActorName activity={activity} />
      <span className="text-muted-foreground">created this</span>
      <CreatedViaSuffix activity={activity} />
    </>
  );
}
