import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from "@erxes/ui/src/components";

import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import { IConfigsMap } from "../types";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import React, { useState } from "react";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings: React.FC<Props> = (props: Props) => {
  const [state, setState] = useState({ config: props.config });

  const onChangeBoard = (boardId: string) => {
    setState(prevState => {
      const updatedConfig = { ...prevState.config, boardId };

      return {
        config: updatedConfig
      };
    });
  };

  const onChangePipeline = (pipelineId: string) => {
    setState(prevState => {
      const updatedConfig = { ...prevState.config, pipelineId };

      return {
        config: updatedConfig
      };
    });
  };

  const onChangeStage = (stageId: string) => {
    setState(prevState => {
      const updatedConfig = { ...prevState.config, stageId };

      return {
        config: updatedConfig
      };
    });
  };

  const onSave = e => {
    e.preventDefault();
    const { configsMap, currentConfigKey } = props;
    const key = state.config.stageId;
    const returnStageInEbarimt = { ...configsMap.returnStageInEbarimt };

    if (key !== currentConfigKey) {
      delete returnStageInEbarimt[currentConfigKey];
    }

    returnStageInEbarimt[key] = state.config;
    props.save({ ...configsMap, returnStageInEbarimt });
  };

  const onDelete = e => {
    e.preventDefault();

    props.delete(props.currentConfigKey);
  };

  const onChangeConfig = (code: string, value) => {
    setState(prevState => {
      const updatedConfig = { ...prevState.config, [code]: value };

      return {
        config: updatedConfig
      };
    });
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  return (
    <CollapseContent
      title={__(state.config.title)}
      transparent={true}
      beforeTitle={<Icon icon="settings" />}
      open={props.currentConfigKey === "newEbarimtConfig" ? true : false}
    >
      <FormGroup>
        <ControlLabel>{__("Title")}</ControlLabel>
        <FormControl
          defaultValue={state.config["title"]}
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
          boardId={state.config.boardId}
          pipelineId={state.config.pipelineId}
          stageId={state.config.stageId}
          onChangeBoard={onChangeBoard}
          onChangePipeline={onChangePipeline}
          onChangeStage={onChangeStage}
        />
      </FormGroup>

      <ModalFooter>
        <Button
          btnStyle="danger"
          icon="times-circle"
          onClick={onDelete}
          uppercase={false}
        >
          Delete
        </Button>

        <Button
          btnStyle="success"
          icon="check-circle"
          onClick={onSave}
          uppercase={false}
          disabled={state.config.stageId ? false : true}
        >
          Save
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
};
export default PerSettings;
