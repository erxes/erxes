import { IUser } from "../../types";
// import { gql, useMutation } from '@apollo/client';
import React from "react";

// import { mutations } from '../../user/graphql';
// import Header from '../components/Header';

type Props = {
  config: any;
  currentUser: IUser;
  headerHtml?: string;
  headingSpacing?: boolean;
  headerBottomComponent?: React.ReactNode;
  notificationsCount: number;
};

function HeaderContainer(props: Props) {
  // const [logout, { data, error }] = useMutation(gql(mutations.logout));

  // if (error) {
  //   return <div>{error.message}</div>;
  // }

  // if (data) {
  //   window.location.href = '/';
  // }

  // const updatedProps = {
  //   ...props,
  //   logout,
  // };

  return null;
  // return <Header {...updatedProps} />;
}

export default HeaderContainer;
