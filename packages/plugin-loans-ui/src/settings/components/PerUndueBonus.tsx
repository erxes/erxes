import {
  Button,
  CollapseContent,
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter
} from "@erxes/ui/src";
import React, { useEffect, useState } from "react";

import { DateContainer } from "@erxes/ui/src/styles/main";
import { IConfigsMap } from "../types";
import { __ } from "coreui/utils";
import dayjs from "dayjs";

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
      currentConfigKey != "newUndueConfig"
        ? currentConfigKey
        : Math.floor(Math.random() * 1000000000000000);

    let newConfig = JSON.parse(JSON.stringify(configsMap));

    newConfig.lossConfig[key] = config;
    props.save(newConfig);
  };

  const onDelete = (e) => {
    e.preventDefault();

    props.delete(props.currentConfigKey);
  };

  const onChangeConfig = (code: string, value) => {
    config[code] = value;
    setConfig(config);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onChangeDate = (code: string, value) => {
    onChangeConfig(code, dayjs(value).format("YYYY-MM-DDTHH:mm:ssZ[Z]"));
  };

  return (
    <CollapseContent
      title={__(config.title)}
      open={props.currentConfigKey === "newEbarimtConfig" ? true : false}
    >
      <FormGroup>
        <ControlLabel>{__("Title")}</ControlLabel>
        <FormControl
          defaultValue={config["title"]}
          onChange={onChangeInput.bind(this, "title")}
          required={true}
          autoFocus={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Start Date")}</ControlLabel>
        <DateContainer>
          <DateControl
            name="startDate"
            dateFormat="YYYY/MM/DD"
            value={config["startDate"]}
            onChange={(e) => onChangeDate("startDate", e)}
          />
        </DateContainer>
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("End Date")}</ControlLabel>
        <DateContainer>
          <DateControl
            name="endDate"
            dateFormat="YYYY/MM/DD"
            value={config["endDate"]}
            onChange={onChangeDate.bind(this, "endDate")}
          />
        </DateContainer>
      </FormGroup>

      <FormGroup>
        <ControlLabel>{__("Percent")}</ControlLabel>
        <FormControl
          defaultValue={config["percent"]}
          type="number"
          min={0}
          max={100}
          onChange={onChangeInput.bind(this, "percent")}
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
