import React, { createContext, useContext, useState } from 'react';
import { IUser } from 'ui-modules';

export type IBroadcastMemberContext = {
  memberIds: string[];
  onSelect: (member: IUser | null) => void;
  members: IUser[];
  setMembers: (members: IUser[]) => void;
  loading: boolean;
  variables: any;
};

export const BroadcastMemberContext =
  createContext<IBroadcastMemberContext | null>(null);

export const useBroadcastMemberContext = () => {
  const context = useContext(BroadcastMemberContext);
  if (!context) {
    throw new Error(
      'useBroadcastMemberContext must be used within a BroadcastMemberProvider',
    );
  }
  return context;
};

export const SelectMemberProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  members,
  variables,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange: (value: string[] | string, meta: any) => void;
  members?: any[];
  variables?: any;
}) => {
  const [_members, setMembers] = useState<any[]>(members || []);
  const isSingleMode = mode === 'single';

  const onSelect = (member: any) => {
    if (!member) return;

    if (isSingleMode) {
      setMembers([member]);
      return onValueChange?.(member._id, member);
    }

    const arrayValue = Array.isArray(value) ? value : [];

    const isMemberSelected = arrayValue.includes(member._id);
    const newSelectedMemberIds = isMemberSelected
      ? arrayValue.filter((id) => id !== member._id)
      : [...arrayValue, member._id];

    setMembers((prev) =>
      [...prev, member].filter((b) => newSelectedMemberIds.includes(b._id)),
    );

    onValueChange?.(newSelectedMemberIds, member);
  };

  return (
    <BroadcastMemberContext.Provider
      value={{
        memberIds: !value ? [] : Array.isArray(value) ? value : [value],
        onSelect,
        setMembers,
        members: _members,
        loading: false,
        variables,
      }}
    >
      {children}
    </BroadcastMemberContext.Provider>
  );
};
