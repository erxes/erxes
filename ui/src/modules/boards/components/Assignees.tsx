import { IUser } from 'modules/auth/types';
import { getUserAvatar } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  > img {
    border-radius: 14px;
    float: left;
    margin-left: 2px;
  }
`;

type Props = {
  users: IUser[];
  limit?: number;
};

function Assignees(props: Props) {
  const getFullName = (user: IUser) => {
    return user.details ? user.details.fullName : 'Unknown';
  };

  const { users = [], limit = 3 } = props;

  const activeUsers = users.filter(user => user.isActive);

  return (
    <Wrapper>
      {activeUsers.slice(0, limit).map(user => (
        <img
          alt={getFullName(user)}
          title={getFullName(user)}
          key={user._id}
          src={getUserAvatar(user)}
          width={28}
          height={28}
        />
      ))}
    </Wrapper>
  );
}

export default Assignees;
