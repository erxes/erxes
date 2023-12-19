import { gql, useMutation } from "@apollo/client";

import { IUser } from "../../../types";
import NotificationSettings from "../../components/notifications/Settings";
import React from "react";

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
