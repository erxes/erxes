import {
  ICommonFormProps,
  ICommonListProps,
} from "@erxes/ui-settings/src/common/types";
import { Link, useLocation } from "react-router-dom";
import { __, router } from "modules/common/utils";

import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import { AppConsumer } from "appContext";
import Button from "@erxes/ui/src/components/Button";
import { ControlLabel } from "@erxes/ui/src/components/form";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import React from "react";
import Table from "@erxes/ui/src/components/table";
import TextInfo from "@erxes/ui/src/components/TextInfo";
import Tip from "@erxes/ui/src/components/Tip";
import Toggle from "@erxes/ui/src/components/Toggle";
import { UserAvatar } from "../styles";
import UserForm from "@erxes/ui/src/team/containers/UserForm";
import UserResetPasswordForm from "@erxes/ui/src/team/containers/UserResetPasswordForm";
import { useNavigate } from "react-router-dom";

type IProps = {
  changeStatus: (id: string) => void;
  resendInvitation: (email: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  queryParams?: Record<string, string>;
};

type FinalProps = ICommonListProps &
  ICommonFormProps &
  IProps & { currentUser: IUser };

const UserList = (props: FinalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onAvatarClick = (object) => {
    return navigate(`details/${object._id}`);
  };

  const removeUserQueryParams = () => {
    const { queryParams } = props;
    if (queryParams && queryParams.positionIds) {
      router.removeParams(navigate, location, "positionIds");
    }
  };

  const renderForm = (formProps) => {
    const onCloseModal = () => {
      removeUserQueryParams();
      formProps.closeModal();
    };

    return (
      <UserForm
        {...formProps}
        closeModal={onCloseModal}
        queryParams={props.queryParams}
        renderButton={props.renderButton}
      />
    );
  };

  const renderEditAction = (user: IUser) => {
    const { currentUser } = props;

    if (user._id === currentUser._id) {
      return (
        <Tip text={__("View Profile")} placement="top">
          <Link to="/profile">
            <Icon icon="user-6" size={15} />
          </Link>
        </Tip>
      );
    }

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="top">
          <Icon icon="pen-1" size={15} />
        </Tip>
      </Button>
    );

    const content = (props) => {
      return renderForm({ ...props, object: user });
    };

    const onModalExit = () => {
      removeUserQueryParams();
    };

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        onExit={onModalExit}
        trigger={editTrigger}
        content={content}
      />
    );
  };

  const renderResetPasswordForm = (props) => {
    return <UserResetPasswordForm {...props} />;
  };

  const renderResetPassword = (user: IUser) => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__("Reset Member Password")} placement="top">
          <Icon icon="lock-alt" size={15} />
        </Tip>
      </Button>
    );

    const content = (props) => {
      return renderResetPasswordForm({ ...props, object: user });
    };

    return (
      <ModalTrigger
        title="Reset member password"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  const renderResendInvitation = (user: IUser) => {
    const onClick = () => {
      props.resendInvitation(user.email);
    };

    if (user.status !== "Not verified") {
      return null;
    }

    return (
      <Button btnStyle="link" onClick={onClick}>
        <Tip text={__("Resend")} placement="top">
          <Icon icon="redo" size={15} />
        </Tip>
      </Button>
    );
  };

  const renderRows = ({ objects }: { objects: IUser[] }) => {
    return objects.map((object) => {
      const onClick = () => onAvatarClick(object);
      const onChange = () => props.changeStatus(object._id);

      return (
        <tr key={object._id}>
          <UserAvatar onClick={onClick}>
            <NameCard user={object} avatarSize={30} singleLine={true} />
          </UserAvatar>
          <td>
            <TextInfo
              $textStyle={object.status === "Verified" ? "success" : "warning"}
            >
              {object.status || "Verified"}
            </TextInfo>
          </td>
          <td>{object.email}</td>
          <td>{object.employeeId || "-"}</td>
          <td>
            <Toggle
              defaultChecked={object.isActive}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>,
              }}
              onChange={onChange}
            />
          </td>
          <td>
            <ActionButtons>
              {renderResendInvitation(object)}
              {renderEditAction(object)}
              {renderResetPassword(object)}
            </ActionButtons>
          </td>
        </tr>
      );
    });
  };

  const renderContent = (props) => {
    return (
      <>
        <Table $wideHeader={true}>
          <thead>
            <tr>
              <th>
                <ControlLabel>{__("Full name")}</ControlLabel>
              </th>
              <th>
                <ControlLabel>{__("Invitation status")}</ControlLabel>
              </th>
              <th>
                <ControlLabel>{__("Email")}</ControlLabel>
              </th>
              <th>
                <ControlLabel>{__("Employee Id")}</ControlLabel>
              </th>
              <th>
                <ControlLabel>{__("Status")}</ControlLabel>
              </th>
              <th>
                <ControlLabel>{__("Actions")}</ControlLabel>
              </th>
            </tr>
          </thead>
          <tbody>{renderRows(props)}</tbody>
        </Table>
      </>
    );
  };

  return renderContent(props);
};

const WithConsumer = (props: IProps & ICommonListProps & ICommonFormProps) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <UserList {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
