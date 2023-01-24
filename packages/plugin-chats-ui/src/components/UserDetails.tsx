import React from 'react';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import { UserDetailsWrapper, UserDetailsItem } from '../styles';

type Props = {
  users: any;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const UserDetails = (props: FinalProps) => {
  const { users, currentUser } = props;

  const user =
    users.length > 1
      ? users.filter(u => u._id !== currentUser._id)[0]
      : users[0];

  return (
    <UserDetailsWrapper>
      <Avatar user={user} size={64} />

      <h3>{user.details?.fullName || user.email}</h3>
      <span>{user.details?.position || '-'}</span>
      <hr />
      <UserDetailsItem>
        <p>Description</p>
        <p>{user.details?.description || '-'}</p>
      </UserDetailsItem>
      <UserDetailsItem>
        <p>Email</p>
        <p>{user.email || '-'}</p>
      </UserDetailsItem>
      <UserDetailsItem>
        <p>Phone</p>
        <p>{user.details?.operatorPhone || '-'}</p>
      </UserDetailsItem>
      <UserDetailsItem>
        <p>Employee ID</p>
        <p>{user.employeeId || '-'}</p>
      </UserDetailsItem>
      <UserDetailsItem>
        <p>Departments</p>
        <p>
          {user.departments
            ? user.departments.map(i => (
                <span key={i.title}>
                  {i.title}
                  <br />
                </span>
              ))
            : '-'}
        </p>
      </UserDetailsItem>
      <UserDetailsItem>
        <p>Branches</p>
        <p>
          {user.branches
            ? user.branches.map(i => (
                <span key={i.title}>
                  {i.title}
                  <br />
                </span>
              ))
            : '-'}
        </p>
      </UserDetailsItem>
    </UserDetailsWrapper>
  );
};

const WithCurrentUser = withCurrentUser(UserDetails);

export default (props: Props) => <WithCurrentUser {...props} />;
