import { IUser, IUserDoc } from "modules/auth/types";
import { __, getConstantFromStore } from "modules/common/utils";

import Button from "modules/common/components/Button";
import Form from "modules/common/components/form/Form";
import { ModalFooter } from "modules/common/styles/main";
import React from "react";
import UserCommonInfos from "@erxes/ui-settings/src/common/components/UserCommonInfos";

type Props = {
  currentUser: IUser;
  closeModal: () => void;
  save: (
    variables: IUserDoc & { password?: string },
    callback: () => void
  ) => void;
};

type State = {
  avatar: string;
  isShowPasswordPopup: boolean;
};

class EditProfile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { currentUser } = props;
    const { details } = currentUser;

    this.state = {
      avatar: details ? details.avatar || "" : "",
      isShowPasswordPopup: false,
    };
  }

  closeAllModals = () => {
    this.props.closeModal();
  };

  handleSubmit = (values: any) => {
    const links = {};

    getConstantFromStore("social_links").forEach((link) => {
      links[link.value] = values[link.value];
    });

    this.props.save(
      {
        username: values.username,
        email: values.email,
        details: {
          avatar: this.state.avatar,
          shortName: values.shortName,
          fullName: values.fullName,
          birthDate: values.birthDate,
          position: values.position,
          workStartedDate: values.workStartedDate,
          location: values.location,
          description: values.description,
          operatorPhone: values.operatorPhone,
          firstName: values.firstName,
          middleName: values.middleName,
          lastName: values.lastName,
        },
        links,
        employeeId: values.employeeId !== "" ? values.employeeId : null,
      },
      this.closeAllModals
    );
  };

  onAvatarUpload = (url) => {
    this.setState({ avatar: url });
  };

  renderContent = (formProps) => {
    return (
      <>
        <UserCommonInfos
          formProps={formProps}
          user={this.props.currentUser}
          onAvatarUpload={this.onAvatarUpload}
        />

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>

          <Button type="submit" btnStyle="success" icon="check-circle">
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <Form renderContent={this.renderContent} onSubmit={this.handleSubmit} />
    );
  }
}

export default EditProfile;
