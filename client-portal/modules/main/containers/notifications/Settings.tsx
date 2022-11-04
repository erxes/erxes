import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

import { IUser, NotificationDetailQueryResponse } from '../../../types';
import NotificationSettings from '../../components/notifications/Settings';

type Props = { currentUser: IUser };

function NotificationDetailContainer(props: Props) {

  const onSave = (doc: { [key: string]: any }) => {};

  const updatedProps = {
    ...props,
    onSave,
  };

  return <NotificationSettings {...updatedProps} />;
}

export default NotificationDetailContainer;
