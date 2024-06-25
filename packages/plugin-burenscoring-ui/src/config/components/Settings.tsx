import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components";
import React, { useState } from "react";
import { IConfigsMaps } from "../../types";
import { __ } from "@erxes/ui/src/utils";
import { ModalFooter } from "@erxes/ui/src/styles/main";

type Props = {
  save: (configsMap: IConfigsMaps) => void;
  configsMap: IConfigsMaps;
  customFields: any;
};

export default function GeneralSettings(props: Props) {
  const burenScoringConfig = props.configsMap?.burenScoringConfig || {};
  const [url, setUrl] = useState(burenScoringConfig?.url || "");
  const [client_id, setClient_id] = useState(
    burenScoringConfig?.client_id || ""
  );
  const [secretKey, setSecretKey] = useState(
    burenScoringConfig?.secretKey || ""
  );
  const configField = burenScoringConfig?.field || "";
  const [field, setField] = useState(configField);
  const fields = props.customFields?.fieldsCombinedByContentType || [];

  const onSave = (e) => {
    e.preventDefault();
    const { configsMap } = props;
    configsMap.burenScoringConfig = {
      url,
      client_id,
      secretKey,
      field,
    };
    props.save(configsMap);
  };
  return (
    <CollapseContent title={__("Buren Scoring config")} open>
      <FormGroup>
        <ControlLabel>{__("url")}</ControlLabel>
        <FormControl
          defaultValue={url}
          type="text"
          min={0}
          max={1000}
          onChange={(e: any) => setUrl(e.target.value)}
          required={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("client id")}</ControlLabel>
        <FormControl
          defaultValue={client_id}
          type="text"
          min={0}
          max={100}
          onChange={(e: any) => setClient_id(e.target.value)}
          required={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("secret Key")}</ControlLabel>
        <FormControl
          defaultValue={secretKey}
          type="text"
          min={0}
          max={100}
          onChange={(e: any) => setSecretKey(e.target.value)}
          required={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel required={true}>{__("Choose field")}</ControlLabel>
        <FormControl
          placeholder={__("Choose field")}
          name="field"
          options={fields.map((f) => ({
            value: f.name || "",
            label: f.label || "",
          }))}
          value={field}
          onChange={(e: any) => setField(e.target.value)}
          componentclass="select"
          required={true}
        />
      </FormGroup>

      <ModalFooter>
        <Button
          btnStyle="primary"
          icon="check-circle"
          onClick={(e) => onSave(e)}
          uppercase={false}
        >
          {__("Save")}
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
}
