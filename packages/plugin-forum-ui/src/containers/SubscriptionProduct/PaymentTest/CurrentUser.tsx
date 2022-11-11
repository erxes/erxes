import React, { useEffect, FC } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

const CURRENT_USER = gql`
  query ClientPortalCurrentUser {
    clientPortalCurrentUser {
      _id
      username
      email
      forumIsSubscribed
      erxesCustomerId
      forumSubscriptionEndsAfter
    }
  }
`;

type Props = {
  userChange: (user: any) => any;
};

const CurrentUser: FC<Props> = ({ userChange }) => {
  const { loading, error, data } = useQuery(CURRENT_USER, {
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    userChange(data?.clientPortalCurrentUser);
  }, [data]);

  if (loading) {
    return null;
  }

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  return (
    <div>
      <h1>Current user</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default CurrentUser;
