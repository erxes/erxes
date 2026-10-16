import type { IUser } from 'ui-modules';
import type { IChannelMember } from '@/channels/types';

/** Core can resolve a member without an `_id`; such a member cannot be shown. */
export const toMemberUser = (
  member: IChannelMember['member'],
): IUser | undefined =>
  member?._id
    ? {
        _id: member._id,
        email: member.email ?? undefined,
        username: member.username ?? undefined,
        isActive: member.isActive ?? undefined,
        isOnboarded: member.isOnboarded ?? false,
        details: member.details
          ? {
              firstName: member.details.firstName ?? undefined,
              lastName: member.details.lastName ?? undefined,
              fullName: member.details.fullName ?? undefined,
              avatar: member.details.avatar ?? undefined,
            }
          : undefined,
      }
    : undefined;
