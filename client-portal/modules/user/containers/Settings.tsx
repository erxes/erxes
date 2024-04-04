import { gql, useMutation } from "@apollo/client";

import Alert from "../../utils/Alert";
import React from "react";
import Settings from "../components/Settings";
import SettingsLayoutContainer from "../../main/containers/SettingsLayout";

type Props = {};

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

function SettingsContainer(props: Props) {
  const [settingsMutation] = useMutation(notificationSettingsMutation);

  const onSave = (doc: { [key: string]: any }) => {
    const { receiveByEmail, receiveBySms } = doc;

    settingsMutation({
      variables: {
        receiveByEmail,
        receiveBySms,
      },
    }).then(() => {
      Alert.success("Successfully updated.");
    });
  };

  const updatedProps = {
    ...props,
    onSave,
  };

  return (
    <SettingsLayoutContainer>
      {(layoutProps) => <Settings {...layoutProps} {...updatedProps} />}
    </SettingsLayoutContainer>
  );
}

export default SettingsContainer;
