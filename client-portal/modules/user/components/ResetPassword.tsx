import { LoginFormWrapper, WithIconFormControl } from "../../styles/form";
import React, { useState } from "react";

import Form from "../../common/form/Form";
import FormControl from "../../common/form/Control";
import FormGroup from "../../common/form/Group";
import { IButtonMutateProps } from "../../common/types";
import Icon from "../../common/Icon";
import Layout from "../../main/containers/Layout";
import { Store } from "../../types";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

function ResetPassword({ renderButton }: Props) {
  const renderContent = (formProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <WithIconFormControl>
            <Icon icon="lock-alt" size={26} />
            <FormControl
              {...formProps}
              name="newPassword"
              type="password"
              placeholder={"Enter your new password"}
              required={true}
            />
          </WithIconFormControl>
        </FormGroup>

        <FormGroup>
          {renderButton({
            values,
            isSubmitted,
          })}
        </FormGroup>
      </>
    );
  };

  return (
    <Layout headingSpacing={true}>
      {(props: Store) => (
        <div className="d-flex justify-content-center">
          <LoginFormWrapper>
            <h2>{"Reset password"} &nbsp;</h2>
            <p>{"Enter your new password and sign in again"}</p>

            <Form renderContent={renderContent} />
          </LoginFormWrapper>
        </div>
      )}
    </Layout>
  );
}

export default ResetPassword;
