import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from "@erxes/ui/src/components";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { Alert, __ } from "@erxes/ui/src/utils";
import React, { useState } from "react";
import Select from "react-select";

type Props = {
  config: any;
  configKey: string;
  fieldsCombined: any[];
  save: (key: string, value: any) => void;
  delete: (configKey: string) => void;
};

const PerConfigs = (props: Props) => {
  const { configKey, fieldsCombined, save } = props;

  const [config, setConfig] = useState<any>(props.config);
  const [hasOpen, setHasOpen] = useState<boolean>(false);

  const onChangeBranch = branchId => {
    setConfig(prevConfig => ({ ...prevConfig, branchId }));
  };

  const onChangeAsssignedUserIds = assignedUserIds => {
    setConfig(prevConfig => ({ ...prevConfig, assignedUserIds }));
  };

  const onChangeBoard = (boardId: string) => {
    setConfig(prevConfig => ({ ...prevConfig, boardId }));
  };

  const onChangePipeline = (pipelineId: string) => {
    setConfig(prevConfig => ({ ...prevConfig, pipelineId }));
  };

  const onChangeStage = (stageId: string) => {
    setConfig(prevConfig => ({ ...prevConfig, stageId }));
  };

  const onMapCustomFieldChange = option => {
    const value = !option ? "" : option.value.toString();
    setConfig(prevConfig => ({ ...prevConfig, mapCustomField: value }));
  };

  const onSave = e => {
    e.preventDefault();

    if (!config.branchId) {
      return Alert.error("Please select the branch!");
    }

    save(configKey, config);
  };

  const onDelete = e => {
    e.preventDefault();

    props.delete(configKey);
  };

  const onChangeInput = e => {
    const name = e.target.name;
    const value = e.target.value;

    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: value
    }));
  };

  const mapFieldOptions = (fieldsCombined || []).map(f => ({
    value: f.name,
    label: f.label
  }));

  return (
    <CollapseContent title={__(config.title || "new Config")}>
      <FormGroup>
        <ControlLabel>{"Title"}</ControlLabel>
        <FormControl
          defaultValue={config["title"]}
          name="title"
          onChange={onChangeInput}
          required={true}
          autoFocus={true}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Choose Branch</ControlLabel>
        <SelectBranches
          label={__("Choose branch")}
          name="branchIds"
          multi={false}
          initialValue={config.branchId}
          onSelect={onChangeBranch}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Choose Stage</ControlLabel>
        <BoardSelectContainer
          type="deal"
          autoSelectStage={false}
          boardId={config.boardId}
          pipelineId={config.pipelineId}
          stageId={config.stageId}
          onChangeBoard={onChangeBoard}
          onChangePipeline={onChangePipeline}
          onChangeStage={onChangeStage}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Choose assigned users</ControlLabel>
        <SelectTeamMembers
          label={__("Choose team member")}
          name="assignedUserIds"
          initialValue={config.assignedUserIds}
          onSelect={onChangeAsssignedUserIds}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>{__("Choose map field")}</ControlLabel>
        <Select
          name="deliveryMapField"
          value={mapFieldOptions.find(o => o.value === config.mapCustomField)}
          onChange={onMapCustomFieldChange}
          isClearable={true}
          options={mapFieldOptions}
        />
      </FormGroup>

      <ModalFooter>
        <Button
          btnStyle="simple"
          icon="cancel-1"
          onClick={onDelete}
          uppercase={false}
        >
          Delete
        </Button>

        <Button
          btnStyle="primary"
          icon="check-circle"
          onClick={onSave}
          uppercase={false}
          disabled={config.stageId ? false : true}
        >
          Save
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
};

export default PerConfigs;
