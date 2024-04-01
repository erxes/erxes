import React, { useEffect, useState } from 'react';

import FilterableList from '@erxes/ui/src/components/filterableList/FilterableList';
import { getUserAvatar } from '@erxes/ui/src/utils/index';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from '@erxes/ui/src/utils/index';

import { IDashboard, IReport } from '../../types';

type Props = {
  targets: IReport[] | IDashboard[];
  loading: boolean;
  users: IUser[];
  refetch(searchValue: string): void;
  updateAssign(selectedUserIds: string[]): void;
};

const generateAssignParams = (
  assignees: IUser[] = [],
  targets: IReport[] | IDashboard[] = [],
) => {
  return assignees.map((assignee, i) => {
    const count = targets.reduce((memo, target) => {
      let index = 0;

      if (
        target.assignedUserIds &&
        target.assignedUserIds.indexOf(assignee._id) > -1
      ) {
        index += 1;
      }

      return memo + index;
    }, 0);

    let state = 'none';
    if (count === targets.length) {
      state = 'all';
    } else if (count < targets.length && count > 0) {
      state = 'some';
    }

    return {
      _id: assignee._id,
      title: (assignee.details && assignee.details.fullName) || assignee.email,
      avatar: getUserAvatar(assignee, 60),
      selectedBy: state,
    };
  });
};

const SelectMembersBox = (props: Props) => {
  const { users, targets, loading, updateAssign, refetch } = props;

  const timerRef = React.useRef<number | null>(null);
  const [verifiedUsers, setVerifiedUsers] = useState<any[]>([]);

  useEffect(() => {
    setVerifiedUsers(generateAssignParams(users, targets));
  }, [users]);

  const handleSearch = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchValue = e.target.value;

    timerRef.current = window.setTimeout(() => {
      refetch(searchValue);
    }, 500);
  };

  const handleExit = (items: any[]) => {
    const unchanged = verifiedUsers.reduce(
      (prev, current, index) =>
        prev && current.selectedBy === items[index].selectedBy,
      true,
    );

    if (unchanged) {
      return;
    }

    updateAssign(items.filter((t) => t.selectedBy === 'all').map((t) => t._id));
  };

  const updatedProps = {
    loading,
    selectable: true,
    treeView: false,
    items: JSON.parse(JSON.stringify(verifiedUsers)),
    onExit: handleExit,
    onSearch: handleSearch,
  };

  return <FilterableList {...updatedProps} />;
};

export default SelectMembersBox;
