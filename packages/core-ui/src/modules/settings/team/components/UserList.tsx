import { AppConsumer } from "appContext";
import { IUser } from "@erxes/ui/src/auth/types";
import Button from "@erxes/ui/src/components/Button";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import Table from "@erxes/ui/src/components/table";
import TextInfo from "@erxes/ui/src/components/TextInfo";
import Tip from "@erxes/ui/src/components/Tip";
import Toggle from "@erxes/ui/src/components/Toggle";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { __ } from "modules/common/utils";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import React from "react";
import { Link } from "react-router-dom";
import {
  ICommonFormProps,
  ICommonListProps,
} from "@erxes/ui-settings/src/common/types";
import UserForm from "@erxes/ui-team/src/containers/UserForm";
import UserResetPasswordForm from "@erxes/ui-team/src/containers/UserResetPasswordForm";
import { UserAvatar } from "../styles";
import { ControlLabel } from '@erxes/ui/src/components/form';
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import Dropdown from "react-bootstrap/Dropdown";

type IProps = {
  changeStatus: (id: string) => void;
  resendInvitation: (email: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  totalCount: number;
  queryParams?: any;
};

type FinalProps = ICommonListProps &
  ICommonFormProps &
  IProps & { currentUser: IUser };

type States = {
  searchValue: string;
};

class UserList extends React.Component<FinalProps, States> {
  constructor(props: FinalProps) {
    super(props);

    const {
      queryParams: { searchValue },
    } = props;

    this.state = {
      searchValue: searchValue || "",
    };
  }

  onAvatarClick = (object) => {
    return this.props.history.push(`team/details/${object._id}`);
  };

  renderForm = (props) => {
    return <UserForm {...props} renderButton={this.props.renderButton} />;
  };

  renderEditAction = (user: IUser) => {
    const { currentUser } = this.props;

    if (user._id === currentUser._id) {
      return (
        <Tip text={__("View Profile")} placement="top">
          <Dropdown.Item>
            <Link to="/profile">{__("View Profile")}</Link>
          </Dropdown.Item>
        </Tip>
      );
    }

    const editTrigger = <Dropdown.Item>{__("Edit Action")}</Dropdown.Item>;

    const content = (props) => {
      return this.renderForm({ ...props, object: user });
    };

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  renderResetPasswordForm = (props) => {
    return <UserResetPasswordForm {...props} />;
  };

  renderResetPassword = (user: IUser) => {
    const editTrigger = <Dropdown.Item>{__("Reset Password")}</Dropdown.Item>;

    const content = (props) => {
      return this.renderResetPasswordForm({ ...props, object: user });
    };

    return (
      <ModalTrigger
        title="Reset member password"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  renderResendInvitation(user: IUser) {
    const onClick = () => {
      this.props.resendInvitation(user.email);
    };

    if (user.status !== "Not verified") {
      return null;
    }

    return <Dropdown.Item onClick={onClick}>{__("Resend")}</Dropdown.Item>;
  }

  renderRows({ objects }: { objects: IUser[] }) {
    return objects.map((object) => {
      const onClick = () => this.onAvatarClick(object);
      const onChange = () => this.props.changeStatus(object._id);

      return (
        <tr key={object._id}>
          <UserAvatar onClick={onClick}>
            <NameCard user={object} avatarSize={30} singleLine={true} />
          </UserAvatar>
          <td>
            <TextInfo
              textStyle={object.status === "Verified" ? "success" : "warning"}
            >
              {object.status || "Verified"}
            </TextInfo>
          </td>
          <td>{object.email}</td>
          <td style={{width: 3}}>
            <Toggle
              defaultChecked={object.isActive}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>,
              }}
              onChange={onChange}
            />
          </td>
          <td style={{width: 3}}>
            <Dropdown alignRight={true}>
                <Dropdown.Toggle as={DropdownToggle} id="dropdown-team-member">
                  <Button btnStyle="link">
                    <Tip text={__("Actions")} placement="top">
                      <Icon icon="ellipsis-v" size={20} />
                    </Tip>
                  </Button>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {this.renderResendInvitation(object)}
                  {this.renderEditAction(object)}
                  {this.renderResetPassword(object)}
                </Dropdown.Menu>
            </Dropdown>
          </td>
        </tr>
      );
    });
  }

  renderContent = (props) => {
    return (
      <>
        <Table>
          <thead style={{padding: "5px 0"}}>
            <tr>
              <th><ControlLabel bold={true} uppercase={false}>{__('Full name')}</ControlLabel></th>
              <th><ControlLabel bold={true} uppercase={false}>{__('Invitation status')}</ControlLabel></th>
              <th><ControlLabel bold={true} uppercase={false}>{__('Email')}</ControlLabel></th>
              <th><ControlLabel bold={true} uppercase={false}>{__('Status')}</ControlLabel></th>
              <th><ControlLabel bold={true} uppercase={false}>{__('Actions')}</ControlLabel></th>
            </tr>
          </thead>
          <tbody>{this.renderRows(props)}</tbody>
        </Table>
        <Pagination count={this.props.totalCount} />
      </>
    );
  };

  render() {
    return this.renderContent(this.props);
  }
}

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
