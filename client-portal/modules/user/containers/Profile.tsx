import { AppConsumer } from "../../appContext";
import ButtonMutate from "../../common/ButtonMutate";
import { IButtonMutateProps } from "../../common/types";
import Layout from "../../main/containers/Layout";
import Profile from "../components/Profile";
import React from "react";
import { Store } from "../../types";
import { mutations } from "../graphql";

type Props = {};

function ProfileContainer() {
  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => {
      window.location.href = "/";
    };

    return (
      <ButtonMutate
        mutation={mutations.login}
        variables={{
          ...values,
        }}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        block={true}
        uppercase={true}
        type="submit"
      >
        Sign in
      </ButtonMutate>
    );
  };

  const updatedProps = {};

  return (
    <Layout headingSpacing={true}>
      {(props: Store) => <Profile {...props} {...updatedProps} />}
    </Layout>
  );
}

export default ProfileContainer;
