import { memberQuery } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  Card,
  MEMBER_CONTENT_TYPE,
  memberName,
  readImage,
  Skeleton,
  useOpenRecord,
} from 'erxes-ui';
import { useRoles } from '~/modules/settings/roles/useRoles';
import { MemberStatusBadge } from '~/modules/settings/team-members/MemberStatusBadge';

/**
 * A person: photo, name and role, and their status when they are not an active member. A click
 * opens them in the side panel. `caption` goes over the name, such as the unit they lead.
 */
export const PersonCard = ({ id, caption }: { id: string; caption?: string }) => {
  const { data: person } = useQuery(memberQuery(id));
  const { roleName } = useRoles();
  const { open } = useOpenRecord();

  if (!person)
    return (
      <Card variant="outline" className="size-full">
        <div className="flex size-full items-center gap-2.5 px-3">
          <Skeleton className="size-8 shrink-0" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Card>
    );

  const name = memberName(person);

  return (
    <Card variant="outline" className="group/person relative size-full">
      <button
        type="button"
        aria-label={name}
        className="absolute inset-0 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => open({ contentType: MEMBER_CONTENT_TYPE, contentId: person.id })}
      />
      <div className="pointer-events-none relative flex size-full items-center gap-2.5 px-3">
        <Avatar size="xl">
          <Avatar.Image src={readImage(person.avatarUrl)} />
          <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col">
          {caption && (
            <span className="truncate text-xs text-muted-foreground" title={caption}>
              {caption}
            </span>
          )}
          <span className="truncate text-sm font-medium" title={name}>
            {name}
          </span>
          {!caption && (
            <span className="truncate text-xs text-muted-foreground">{roleName(person.role)}</span>
          )}
        </span>
        {person.status !== 'active' && <MemberStatusBadge user={person} dot size="sm" />}
      </div>
    </Card>
  );
};
