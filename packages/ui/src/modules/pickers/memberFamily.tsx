import { IconUserCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Avatar } from 'erxes-ui/components/avatar';
import { readImage } from 'erxes-ui/utils/core';
import {
  type Member,
  type MemberQueries,
  meFirst,
  memberName,
  useMeId,
  useMembersById,
} from './members';
import { pickerFamily } from './selectFamilyParts';

const MemberItem = ({ item }: { item: Member }) => (
  <span className="flex min-w-0 items-center gap-2">
    <Avatar size="lg">
      <Avatar.Image src={readImage(item.avatarUrl)} />
      <Avatar.Fallback>{memberName(item).charAt(0)}</Avatar.Fallback>
    </Avatar>
    <span className="truncate">{memberName(item)}</span>
  </span>
);

/**
 * 3.x's member picker parts a list page's filter and a form use: `FormItem`, `FilterItem`,
 * `FilterView`, `FilterBar`, `Content` and `Value`, beside `SelectMember`'s own.
 */
export const memberFamily = pickerFamily<{ members: MemberQueries }, Member>({
  name: 'select-member',
  icon: IconUserCircle,
  useById: ({ members }, ids) => {
    const byId = useMembersById(ids, members);
    const team = useQuery(members.team);

    return { byId, loading: ids.length > 0 && team.isPending };
  },
  useList: ({ members }) => {
    const team = useQuery(members.team);
    const meId = useMeId(members);

    return {
      items: meFirst(team.data?.data ?? [], meId),
      loading: team.isPending,
      error: team.error,
    };
  },
  itemKey: (member) => ({ id: member.id, label: `${memberName(member)} ${member.email ?? ''}` }),
  Item: MemberItem,
  useTexts: () => {
    const { t } = useTranslation('ui', { keyPrefix: 'member' });

    return {
      search: t('search', 'Search team members'),
      placeholder: t('select', 'Select a member'),
      count: (count) => t('selected', '{{count}} members', { count }),
    };
  },
});
