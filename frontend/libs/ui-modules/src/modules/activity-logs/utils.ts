import { TActivityLog } from './types';

export function getActivityLogActorName(activity: TActivityLog): string {
  const actor = activity.actor;

  if (!actor) {
    return 'Unknown user';
  }

  return (
    actor.details?.fullName || actor.username || actor.email || 'Unknown user'
  );
}

export function getActivityLogActorInitial(name: string) {
  return name?.[0]?.toUpperCase() || '?';
}

export const getActivityLogActor = (activity: TActivityLog) => {
  const actorName = getActivityLogActorName(activity);

  return {
    name: actorName,
    // initial: actorInitial
  };
};
