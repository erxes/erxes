import { IUser } from 'modules/auth/types';
import queryString from 'query-string';
import React from 'react';
import { withRouter } from 'react-router-dom';

type Props = {
  history: any;
  location: any;
  component: any;
  match: any;
  currentUser: IUser;
  children: React.ReactNode;
};

const Reports = (props: Props) => {
  const queryParams = queryString.parse(props.location.search);
  const Component = props.component;

  const updatedProps = {
    ...props,
    queryParams
  };

  return <Component {...updatedProps} />;
};

export default withRouter<Props>(Reports);
