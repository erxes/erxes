import { Skeleton, TextOverflowTooltip, Tooltip } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { createContext, useContext } from 'react';
import { useUsersGroup } from 'ui-modules/modules/team-members/hooks';
import { IUserGroup } from 'ui-modules/modules/team-members/types/TeamMembers';

export interface IGroupsInlineContext {
  groups: IUserGroup[];
  loading: boolean;
  groupsIds?: string[];
  placeholder?: string;
  updateGroups?: (groups: IUserGroup[]) => void;
}

export const GroupsInlineContext = createContext<IGroupsInlineContext | null>(
  null,
);

export const useGroupsInlineContext = () => {
  const context = useContext(GroupsInlineContext);
  if (!context) {
    throw new Error(
      'useGroupsInlineContext must be used within a GroupsInlineProvider',
    );
  }
  return context;
};

export const GroupsInline = ({
  groups,
  groupsIds,
  placeholder,
  updateGroups,
}: {
  groups: IUserGroup[];
  groupsIds?: string[];
  placeholder?: string;
  updateGroups?: (groups: IUserGroup[]) => void;
}) => {
  return (
    <GroupsInlineProvider
      groups={groups}
      groupsIds={groupsIds}
      placeholder={placeholder}
      updateGroups={updateGroups}
    >
      <GroupsInlineTitle />
    </GroupsInlineProvider>
  );
};

export const GroupsInlineProvider = ({
  children,
  groups,
  groupsIds,
  placeholder,
  updateGroups,
}: {
  children?: React.ReactNode;
  groups?: IUserGroup[];
  groupsIds?: string[];
  placeholder?: string;
  updateGroups?: (groups: IUserGroup[]) => void;
}) => {
  const [_groups, _setGroups] = useState<IUserGroup[]>(groups || []);

  return (
    <GroupsInlineContext.Provider
      value={{
        groups: groups || _groups,
        loading: false,
        groupsIds: groupsIds || [],
        placeholder: placeholder || 'Select Groups',
        updateGroups: updateGroups || _setGroups,
      }}
    >
      {children}
      {groupsIds?.map((groupId) => (
        <GroupInlineEffectComponent key={groupId} groupId={groupId} />
      ))}
    </GroupsInlineContext.Provider>
  );
};

export const GroupInlineEffectComponent = ({
  groupId,
}: {
  groupId: string;
}) => {
  const { groups, groupsIds, updateGroups } = useGroupsInlineContext();
  const { usersGroups } = useUsersGroup();
  const groupDetail =
    usersGroups && usersGroups?.find((g) => g._id === groupId);

  useEffect(() => {
    if (!groupDetail) return;

    const newGroups = [...groups].filter(
      (c) => groupsIds?.includes(c._id) && c._id !== groupDetail._id,
    );

    const alreadyExists = groups.some((g) => g._id === groupDetail._id);

    if (!alreadyExists) {
      updateGroups?.([...newGroups, groupDetail]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupDetail]);

  return null;
};

export const GroupsInlineTitle = () => {
  const { groups, loading, placeholder } = useGroupsInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (groups.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (groups.length >= 3) {
    return (
      <Tooltip>
        <Tooltip.Provider>
          <Tooltip.Trigger>{`${groups.length} Groups`}</Tooltip.Trigger>
          <Tooltip.Content>
            {groups.map((group) => group.name).join(', ')}
          </Tooltip.Content>
        </Tooltip.Provider>
      </Tooltip>
    );
  }
  return (
    <TextOverflowTooltip
      value={groups.map((g) => g.name).join(`, ${groups?.length}`)}
    />
  );
};
