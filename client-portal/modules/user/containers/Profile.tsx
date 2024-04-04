import { AppConsumer } from "../../appContext";
import ButtonMutate from "../../common/ButtonMutate";
import { IButtonMutateProps } from "../../common/types";
import Profile from "../components/Profile";
import React from "react";
import SettingsLayoutContainer from "../../main/containers/SettingsLayout";
import { mutations } from "../graphql";

function ProfileContainer() {
  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.userEdit}
        variables={{
          ...values,
        }}
        isSubmitted={isSubmitted}
        uppercase={true}
        successMessage="Successfully updated!"
        type="submit"
      >
        Update user
      </ButtonMutate>
    );
  };

  return (
    <SettingsLayoutContainer>
      {(props) => <Profile {...props} renderButton={renderButton} />}
    </SettingsLayoutContainer>
  );
}

export default ProfileContainer;
