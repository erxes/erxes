import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from "@erxes/ui/src/components";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils";
import React, { useState, useEffect } from "react";
import PerConditions from "./PerConditions";

type Props = {
  config: any;
  currentConfigKey: string;
  save: (key: string, config: any) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings = (props: Props) => {
  const { currentConfigKey, save } = props;

  const [config, setConfig] = useState(props.config);

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
    save(key, config);
  };

  const onDelete = e => {
    e.preventDefault();

    props.delete(currentConfigKey);
  };

  const onChangeConfig = (code: string, value) => {
    setConfig({ ...config, [code]: value });
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onChangeCheckbox = (code: string, e) => {
    onChangeConfig(code, e.target.checked);
  };

  const addCondition = () => {
    onChangeConfig('conditions', [...config.conditions, { id: Math.random().toString(), }]);
  };

  const renderConditions = () => {
    const remove = (id) => {
      onChangeConfig(
        "conditions",
        config.conditions.filter((c) => c.id !== id)
      );
    };

    const editCondition = (id, condition) => {
      const updated = (config.conditions || []).map((c) =>
        c.id === id ? condition : c
      );
      onChangeConfig("conditions", updated);
    };

    return (config.conditions || []).map((c) => (
      <PerConditions
        key={c.id}
        condition={c}
        onChange={editCondition}
        onRemove={remove}
      />
    ));
  };

  return (
    <CollapseContent
      title={__(config.title)}
      open={currentConfigKey === "newPlacesConfig" ? true : false}
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
      <FormWrapper>
        <FormColumn>
          <FormGroup>
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
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel>Check pricing</ControlLabel>
            <FormControl
              checked={config.checkPricing || false}
              onChange={onChangeCheckbox.bind(this, "checkPricing")}
              componentclass="checkbox"
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>

      {renderConditions()}
      <ModalFooter>
        <Button
          btnStyle="primary"
          onClick={addCondition}
          icon="plus"
          uppercase={false}
        >
          Add condition
        </Button>
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
