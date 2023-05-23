import { IUser, Store } from "../../types";
import { gql, useMutation, useQuery } from "@apollo/client";

import { AppConsumer } from "../../appContext";
import ButtonMutate from "../../common/ButtonMutate";
import { IButtonMutateProps } from "../../common/types";
import Layout from "../../main/containers/Layout";
import React from "react";
import Settings from "../components/Settings";
import { mutations } from "../graphql";

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
      props.saveCallback();
    });
  };

  const updatedProps = {
    ...props,
    onSave,
  };

  return (
    <Layout headingSpacing={true}>
      {(layoutProps: Store) => <Settings {...layoutProps} {...updatedProps} />}
    </Layout>
  );
}

export default SettingsContainer;
