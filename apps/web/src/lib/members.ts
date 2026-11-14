import type { ActorType } from '@erxes/core-contract';
import { type Member, memberName } from 'erxes-ui';

/** A plugin name as people read it: `hr` → `HR`, `ecom` → `Ecom`. */
export const pluginLabel = (name: string) =>
  name.length <= 3 ? name.toUpperCase() : name.charAt(0).toUpperCase() + name.slice(1);

/** Who did it, in words: a member by id (`user`), a plugin by name, or erxes itself. */
export const actorLabel = (
  type: ActorType,
  id: string | null,
  members: Map<string, Member>,
  unknownMember = 'A team member',
) => {
  if (type === 'user') {
    const member = id ? members.get(id) : undefined;

    return member ? memberName(member) : unknownMember;
  }

  if (type === 'plugin') return id ? pluginLabel(id) : 'A plugin';

  if (type === 'customer') return 'A customer';

  return 'erxes';
};
