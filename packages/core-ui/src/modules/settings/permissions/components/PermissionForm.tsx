import { Alert, __ } from "modules/common/utils";
import { Divider, StepBody, StepHeader, StepItem } from "../styles";
import { IActions, IModule } from "../types";
import {
  correctValue,
  filterActions,
  generateListParams,
  generateModuleParams,
  generatedList,
} from "./utils";

import Button from "modules/common/components/Button";
import ButtonMutate from "modules/common/components/ButtonMutate";
import ControlLabel from "modules/common/components/form/Label";
import FormControl from "modules/common/components/form/Control";
import FormGroup from "modules/common/components/form/Group";
import { IUserGroup } from "@erxes/ui-settings/src/permissions/types";
import Info from "modules/common/components/Info";
import { ModalFooter } from "modules/common/styles/main";
import React, { useState } from "react";
import Select from "react-select";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import TextInfo from "modules/common/components/TextInfo";
import { mutations } from "../graphql";

type Props = {
  modules: IModule[];
  actions: IActions[];
  groups: IUserGroup[];
  refetchQueries: any;
  isLoading: boolean;
  closeModal: () => void;
};

type State = {
  selectedModule: string;
  selectedActions: IActions[];
  selectedUserIds: string[];
  selectedGroups: IUserGroup[];
  valueChanged: boolean;
  isSubmitted: boolean;
};

const PermissionForm = (props: Props) => {
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [valueChanged, setValueChanged] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModule) {
      return Alert.error("Please select the module!");
    }

    if (!hasItems(selectedActions)) {
      return Alert.error("Please select at least one action!");
    }

    if (!hasItems(selectedGroups) && !hasItems(selectedUserIds)) {
      return Alert.error("Please select at least one group or user!");
    }

    return setIsSubmitted(true );
  };

  const getVariables = () => {
    return {
      module: selectedModule,
      actions: collectValues(selectedActions),
      userIds: selectedUserIds,
      groupIds: collectValues(selectedGroups),
      allowed: valueChanged,
    };
  };

  const onChange = () => {
    setValueChanged(true);
  };

  const hasItems = (items: string[]) => {
    return items.length > 0 ? true : false;
  };

  const isModuleSelected = () => {
    if (selectedModule) {
      return true;
    }

    return false;
  };

  const select = <T extends keyof State>(name: T, value) => {
    if(name === 'selectedUserIds'){
      setSelectedUserIds(value)
    }
    if(name === 'selectedActions'){
      setSelectedActions(value)
    }
    if(name === 'selectedGroups'){
      setSelectedGroups(value)
    }
  };

  const changeModule = (item: generatedList) => {
    const newSelectedModule = correctValue(item);

    setSelectedModule(newSelectedModule)
    setSelectedActions([])
  };

  const collectValues = (items: generatedList[]) => {
    return items.map((item) => item.value);
  };

  const renderContent = () => {
    const { modules, actions, groups } = props;

    const usersOnChange = (users) => select("selectedUserIds", users);

    return (
      <>
        <Info>
          <strong>User vs. Group Permissions</strong>
          <br />
          <span>
            When a team member is part of two or more User Groups with different
            levels of permissions,
          </span>
          <TextInfo $textStyle="danger">
            the negative permission will overrule.
          </TextInfo>
          <br />
          <span>
            For example, if you're part of the "Admin Group" with all
            permissions allowed, but you've included yourself in the "Support
            Group" with fewer permissions,
          </span>
          <TextInfo $textStyle="danger">
            you might not be able to do certain actions.
          </TextInfo>
        </Info>
        <StepItem>
          <StepHeader
            number="1"
            $isDone={isModuleSelected() && hasItems(selectedActions)}
          >
            {__("What action can do")}
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel required={true}>Choose the module</ControlLabel>
              <Select
                placeholder={__("Choose module")}
                isClearable={true}
                options={generateModuleParams(modules)}
                value={generateModuleParams(modules).find(
                  (o) => o.value === selectedModule
                )}
                onChange={(p) => changeModule(p)}
              />
            </FormGroup>
            <Divider>{__("Then")}</Divider>
            <FormGroup>
              <ControlLabel required={true}>Choose the actions</ControlLabel>
              <Select
                placeholder={__("Choose actions")}
                options={filterActions(actions, selectedModule) || []}
                value={selectedActions}
                isDisabled={!selectedModule}
                onChange={select.bind(this, "selectedActions")}
                isMulti={true}
              />
            </FormGroup>
          </StepBody>
        </StepItem>

        <StepItem>
          <StepHeader
            number="2"
            isDone={hasItems(selectedGroups) || hasItems(selectedUserIds)}
          >
            {__("Who can")}
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel required={true}>Choose the groups</ControlLabel>
              <Select
                placeholder={__("Choose groups")}
                options={generateListParams(groups) || []}
                value={selectedGroups}
                onChange={select.bind(this, "selectedGroups")}
                isMulti={true}
              />
            </FormGroup>
            <Divider>{__("Or")}</Divider>
            <FormGroup>
              <ControlLabel required={true}>Choose the users</ControlLabel>

              <SelectTeamMembers
                label="Choose users"
                name="selectedUserIds"
                initialValue={selectedUserIds}
                onSelect={usersOnChange}
              />
            </FormGroup>
          </StepBody>
        </StepItem>

        <StepItem>
          <StepHeader number="3" isDone={valueChanged}>
            {__("Grant permission")}
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel>Allow</ControlLabel>

              <FormControl
                componentclass="checkbox"
                defaultChecked={false}
                id="allowed"
                onChange={onChange}
              />
              <p>{__("Check if permission is allowed")}</p>
            </FormGroup>
          </StepBody>
        </StepItem>
      </>
    );
  };

  const { closeModal, refetchQueries } = props;

  return (
    <form onSubmit={save}>
      {renderContent()}
      <ModalFooter>
        <Button
          btnStyle="simple"
          type="button"
          onClick={closeModal}
          icon="cancel-1"
        >
          Cancel
        </Button>

        <ButtonMutate
          mutation={mutations.permissionAdd}
          variables={getVariables()}
          callback={closeModal}
          refetchQueries={refetchQueries}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={__(`You successfully added a permission`) + "."}
        />
      </ModalFooter>
    </form>
  );
};

export default PermissionForm;
