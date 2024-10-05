import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from "@erxes/ui/src/components";
import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import { __ } from "@erxes/ui/src/utils";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import React, { useState } from "react";
import { IConfigsMap } from "../types";

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings = (props: Props) => {
  const [config, setConfig] = useState(props.config);
  const { configsMap, currentConfigKey, save } = props;

  const onChangeBoard = (boardId: string) => {
    setConfig({ ...config, boardId });
  };

  const onChangePipeline = (pipelineId: string) => {
    setConfig({ ...config, pipelineId });
  };

  const onChangeStage = (stageId: string) => {
    setConfig({ ...config, stageId });
  };

  const onSave = e => {
    e.preventDefault();
    const key = config.stageId;

    delete configsMap.stageInReturnConfig[currentConfigKey];
    configsMap.stageInReturnConfig[key] = config;
    save(configsMap);
  };

  const onDelete = e => {
    e.preventDefault();

    props.delete(currentConfigKey);
  };

  const onChangeConfig = (code: string, value) => {
    config[code] = value;
    setConfig(config);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const renderInput = (key: string, title?: string, description?: string) => {
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          onChange={onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  return (
    <CollapseContent
      title={__(config.title)}
      open={props.currentConfigKey === "newStageInReturnConfig" ? true : false}
    >
      <FormGroup>
        <ControlLabel>{"Title"}</ControlLabel>
        <FormControl
          defaultValue={config["title"]}
          onChange={onChangeInput.bind(this, "title")}
          required={true}
          autoFocus={true}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Destination Stage</ControlLabel>
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

      {renderInput("userEmail", "userEmail", "")}

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
export default PerSettings;
