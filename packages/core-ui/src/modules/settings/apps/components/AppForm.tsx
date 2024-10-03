import { Alert, __ } from "modules/common/utils";
import { IApp, IAppParams } from "../types";

import Button from "modules/common/components/Button";
import ControlLabel from "modules/common/components/form/Label";
import Select from "react-select";
import Datetime from "@nateradebaugh/react-datetime";
import FormControl from "modules/common/components/form/Control";
import FormGroup from "modules/common/components/form/Group";
import { ModalFooter } from "modules/common/styles/main";
import React from "react";
import dayjs from "dayjs";
import { IUserGroup } from "@erxes/ui-settings/src/permissions/types";

type Props = {
  userGroups: IUserGroup[];
  app?: IApp;
  closeModal: () => void;
  addApp: (doc: IAppParams) => void;
  editApp: (_id: string, doc: IAppParams) => void;
};

type State = {
  userGroupId: string;
  name: string;
  expireDate?: Date;
  noExpire: boolean;
  allowAllPermission: boolean;
};

export default class AppForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {
      app = {
        userGroupId: "",
        name: "",
        expireDate: dayjs().add(30, "day").toDate(),
      },
    } = props;

    this.state = {
      userGroupId: app.userGroupId,
      name: app.name,
      expireDate: app.expireDate,
      noExpire: false,
      allowAllPermission: false,
    };
  }

  render() {
    const { app, userGroups = [], closeModal, addApp, editApp } = this.props;
    const { userGroupId, expireDate, allowAllPermission, noExpire } =
      this.state;

    const onGroupChange = (option) => {
      const value = option ? option.value : "";

      this.setState({ userGroupId: value });
    };

    const onDateChange = (val) => {
      this.setState({ expireDate: val });
    };

    const options = userGroups.map((g) => ({ value: g._id, label: g.name }));

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const el = document.getElementById("app-name") as HTMLInputElement;

      if (!(el && el.value)) {
        return Alert.warning(__("App name must not be empty"));
      }
      if (!userGroupId && !allowAllPermission) {
        return Alert.warning(
          __("User group or allow all permission must be chosen")
        );
      }

      const doc = {
        name: el.value,
        userGroupId,
        expireDate,
        allowAllPermission,
        noExpire,
      };

      if (app) {
        editApp(app._id, doc);
      }

      addApp(doc);

      return closeModal();
    };

    return (
      <form onSubmit={onSubmit}>
        <FormGroup>
          <ControlLabel required={true}>{__("Name")}</ControlLabel>
          <FormControl defaultValue={app && app.name} id="app-name" />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("User group")}</ControlLabel>
          <Select
            isClearable={true}
            placeholder={__("Choose user group")}
            options={options}
            value={options.find(
              (option) => option.value === this.state.userGroupId
            )}
            onChange={(opt) => onGroupChange(opt)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Expire date")}</ControlLabel>
          <Datetime
            // inputProps={{ placeholder: __("Click to select a date") }}
            dateFormat={true}
            timeFormat={false}
            value={expireDate}
            // closeOnSelect={true}
            // utc={true}
            // input={false}
            onChange={onDateChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("No expire")}</ControlLabel>
          <FormControl
            checked={this.state.noExpire}
            componentclass="checkbox"
            onChange={() => this.setState({ noExpire: !this.state.noExpire })}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Allow all permission")}</ControlLabel>
          <FormControl
            checked={this.state.allowAllPermission}
            componentclass="checkbox"
            onChange={() =>
              this.setState({
                allowAllPermission: !this.state.allowAllPermission,
              })
            }
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            {__("Cancel")}
          </Button>
          <Button btnStyle="success" type="submit" icon="checked-1">
            {__(app ? "Edit" : "Add")}
          </Button>
        </ModalFooter>
      </form>
    );
  } // end render()
}
