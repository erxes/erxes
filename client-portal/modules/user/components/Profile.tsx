import { ControlLabel, Form, FormControl, FormGroup } from "../../common/form";
import { SettingsContent, SettingsTitle } from "../../styles/profile";

import { IFormProps } from "../../common/types";
import { IUser } from "../../types";
import { ModalFooter } from "../../common/form/styles";
import React from "react";
import { useRouter } from "next/router";

type Props = {
  currentUser: IUser;
  renderButton: ({}: any) => void;
};

function Profile({ currentUser, renderButton }: Props) {
  const generateDoc = (values) => {
    const { object } = {} as any;

    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      ...finalValues,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const object = currentUser || ({} as any);

    if (object) {
      values._id = object._id;
    }

    return (
      <>
        <SettingsTitle>User Profile</SettingsTitle>
        <SettingsContent>
          <FormGroup horizontal={true}>
            <div>
              <ControlLabel>First name</ControlLabel>
              <FormControl
                {...formProps}
                name="firstName"
                defaultValue={object.firstName}
              />
            </div>

            <div>
              <ControlLabel>Last name</ControlLabel>
              <FormControl
                {...formProps}
                name="lastName"
                defaultValue={object.lastName}
              />
            </div>
          </FormGroup>

          <FormGroup horizontal={true}>
            <div>
              <ControlLabel>User name</ControlLabel>
              <FormControl
                {...formProps}
                name="username"
                defaultValue={object.username}
              />
            </div>

            <div>
              <ControlLabel required={true}>Email</ControlLabel>
              <FormControl
                {...formProps}
                name="email"
                type="email"
                defaultValue={object.email}
                required={true}
              />
            </div>
          </FormGroup>

          <FormGroup horizontal={true}>
            <div>
              <ControlLabel>Phone</ControlLabel>
              <FormControl
                {...formProps}
                name="phone"
                defaultValue={object.phone}
              />
            </div>

            {object.companyName && (
              <div>
                <ControlLabel>Company name</ControlLabel>
                <FormControl
                  {...formProps}
                  name="companyName"
                  type="number"
                  defaultValue={object.phone}
                />
              </div>
            )}
          </FormGroup>

          <ModalFooter>
            <>
              {renderButton({
                name: "user group",
                values: generateDoc(values),
                isSubmitted,
                callback: () => ({}),
                object: {},
              })}
            </>
          </ModalFooter>
        </SettingsContent>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}

export default Profile;
