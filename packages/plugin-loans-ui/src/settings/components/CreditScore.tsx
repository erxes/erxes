import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter
} from "@erxes/ui/src";
import React, { useState } from "react";

import { IConfigsMap } from "../types";
import { __ } from "coreui/utils";

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings = (props: Props) => {
  const [config, setConfig] = useState(props.config);
  const { configsMap, currentConfigKey } = props;

  const onSave = (e) => {
    e.preventDefault();
    const key =
      currentConfigKey != "newCreditConfig"
        ? currentConfigKey
        : Math.floor(Math.random() * 1000000000000000);

    let newConfig = JSON.parse(JSON.stringify(configsMap));

    newConfig.creditScore[key] = config;
    props.save(newConfig);
  };

  const onDelete = (e) => {
    e.preventDefault();

    props.delete(props.currentConfigKey);
  };

  const onChangeConfig = (code: string, value) => {
    setConfig((v) => ({ ...v, [code]: value }));
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  return (
    <CollapseContent title={__(config.title)}>
      <FormGroup>
        <ControlLabel>{__("Title")}</ControlLabel>
        <FormControl
          defaultValue={config["title"]}
          onChange={(e: any) => onChangeInput("title", e)}
          required={true}
          autoFocus={true}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>{__("Start score")}</ControlLabel>
        <FormControl
          value={config["startScore"]}
          type="number"
          min={0}
          max={700}
          onChange={(e: any) => onChangeInput("startScore", e)}
          required={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("End score")}</ControlLabel>
        <FormControl
          value={config["endScore"]}
          type="number"
          min={0}
          max={700}
          onChange={(e: any) => onChangeInput("endScore", e)}
          required={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Amount")}</ControlLabel>
        <FormControl
          value={config["amount"]}
          type="number"
          useNumberFormat
          min={0}
          onChange={(e: any) => onChangeInput("amount", e)}
          required={true}
        />
      </FormGroup>

      <ModalFooter>
        <Button
          btnStyle="simple"
          icon="cancel-1"
          onClick={onDelete}
          uppercase={false}
        >
          {__("Delete")}
        </Button>

        <Button
          btnStyle="primary"
          icon="check-circle"
          onClick={onSave}
          uppercase={false}
        >
          {__("Save")}
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
};

export default PerSettings;
