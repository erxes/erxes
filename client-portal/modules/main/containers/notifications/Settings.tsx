import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

import { IUser, NotificationDetailQueryResponse } from '../../../types';
import NotificationSettings from '../../components/notifications/Settings';

type Props = { currentUser: IUser; saveCallback: () => void };

const notificationSettingsMutation = gql`
  mutation ClientPortalUserUpdateNotificationSettings(
    $configs: [NotificationConfigInput]
    $receiveByEmail: Boolean
    $receiveBySms: Boolean
  ) {
    clientPortalUserUpdateNotificationSettings(
      configs: $configs
      receiveByEmail: $receiveByEmail
      receiveBySms: $receiveBySms
    ) {
      _id
    }
  }
`;

function NotificationDetailContainer(props: Props) {
  const [settingsMutation] = useMutation(notificationSettingsMutation);

  const onSave = (doc: { [key: string]: any }) => {
    const { receiveByEmail, receiveBySms } = doc;

    settingsMutation({
      variables: {
        receiveByEmail,
        receiveBySms,
      },
    }).then(() => {
      props.saveCallback();
    });
  };

  const updatedProps = {
    ...props,
    onSave,
  };

  return <NotificationSettings {...updatedProps} />;
}

export default NotificationDetailContainer;
