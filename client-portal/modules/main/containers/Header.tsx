import { gql, useMutation } from '@apollo/client';
import React from 'react';

import { Config, IUser } from '../../types';
import { mutations } from '../../user/graphql';
import Header from '../components/Header';

type Props = {
  config: Config;
  currentUser: IUser;
  headerHtml?: string;
  headingSpacing?: boolean;
  headerBottomComponent?: React.ReactNode;
  notificationsCount: number;
};

function HeaderContainer(props: Props) {
  const [logout, { data, error }] = useMutation(gql(mutations.logout));

  if (error) {
    return <div>{error.message}</div>;
  }

  if (data) {
    window.location.href = '/';
  }

  const updatedProps = {
    ...props,
    logout,
  };

  return <Header {...updatedProps} />;
}

export default HeaderContainer;
