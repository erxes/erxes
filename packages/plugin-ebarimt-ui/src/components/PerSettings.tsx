import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from "@erxes/ui/src/components";
import { FlexBetween } from '@erxes/ui-settings/src/styles';
import { FormColumn, FormWrapper, } from "@erxes/ui/src/styles/main";
import React, { useState } from "react";

import BoardSelectContainer from "@erxes/ui-cards/src/boards/containers/BoardSelect";
import { DISTRICTS } from "../constants";
import { IConfigsMap } from "../types";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings: React.FC<Props> = (props: Props) => {
  const { config, configsMap, currentConfigKey, save } = props;
  const [state, setState] = useState({ config: config });

  const onChangeBoard = (boardId: string) => {
    setState((prevState) => {
      const updatedConfig = { ...prevState.config, boardId };

      return {
        config: updatedConfig,
      };
    });
  };

  const onChangePipeline = (pipelineId: string) => {
    setState((prevState) => {
      const updatedConfig = { ...prevState.config, pipelineId };

      return {
        config: updatedConfig,
      };
    });
  };

  const onChangeStage = (stageId: string) => {
    setState((prevState) => {
      const updatedConfig = { ...prevState.config, stageId };

      return {
        config: updatedConfig,
      };
    });
  };

  const onSave = (e) => {
    e.preventDefault();
    const key = state.config.stageId;

    const stageInEbarimt = { ...configsMap.stageInEbarimt };

    if (key !== currentConfigKey) {
      delete stageInEbarimt[currentConfigKey];
    }

    stageInEbarimt[key] = state.config;
    save({ ...configsMap, stageInEbarimt });
  };

  const onDelete = (e) => {
    e.preventDefault();

    props.delete(currentConfigKey);
  };

  const onChangeCheckbox = (code: string, e) => {
    onChangeConfig(code, e.target.checked);
  };

  const onChangeConfig = (code: string, value) => {
    setState((prevState) => {
      const updatedConfig = { ...prevState.config, [code]: value };

      return {
        config: updatedConfig,
      };
    });
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
          defaultValue={state.config[key]}
          onChange={onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  const renderCheckbox = (
    key: string,
    title?: string,
    description?: string
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={state.config[key]}
          onChange={onChangeCheckbox.bind(this, key)}
          componentclass="checkbox"
        />
      </FormGroup>
    );
  };

  return (
    <CollapseContent
      title={__(state.config.title)}
      transparent={true}
      beforeTitle={<Icon icon="settings" />}
      open={currentConfigKey === "newEbarimtConfig" ? true : false}
    >
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel>{"Title"}</ControlLabel>
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
          {renderInput('posNo', 'pos No', '')}
          {renderInput('branchNo', 'branch No', '')}
          {renderCheckbox(
            'skipPutData',
            'skip Ebarimt',
            'When checked only  print inner bill'
          )}
        </FormColumn>
        <FormColumn>
          {renderInput("companyName", "company Name")}
          {renderInput('companyRD', 'company RD', '')}
          {renderInput('merchantTin', 'merchantTin', '')}
          <FlexBetween>
            <FormGroup>
              <ControlLabel>Branch of Provice / District</ControlLabel>
              <FormControl
                componentclass="select"
                value={(state.config['districtCode'] as string).substring(0, 2) || ''}
                options={[
                  { value: '', label: '' },
                  ...DISTRICTS.map(d => ({ value: d.branchCode, label: d.branchName }))
                ]}
                onChange={(e) => {
                  onChangeConfig('districtCode', (e.target as any).value)
                }}
                required={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>SUB Provice / District</ControlLabel>
              <FormControl
                componentclass="select"
                value={(state.config['districtCode'] as string).substring(2, 4) || ''}
                options={[
                  { value: '', label: '' },
                  ...(DISTRICTS.find(d => (
                    d.branchCode === (state.config['districtCode'] as string).substring(0, 2)
                  ))?.subBranches || []).map(sd => (
                    { value: sd.subBranchCode, label: sd.subBranchName })
                  )
                ]}
                onChange={(e) => {
                  onChangeConfig(
                    'districtCode',
                    `${(state.config['districtCode'] as string).substring(0, 2)}${(e.target as any).value}`
                  )
                }}
                required={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>District Code</ControlLabel>
              <FormControl
                value={state.config['districtCode']}
                onChange={onChangeInput.bind(this, 'districtCode')}
                required={true}
              />
            </FormGroup>
          </FlexBetween>
          {renderInput('defaultGSCode', 'default united code', '')}
          {renderCheckbox('hasVat', 'has Vat', '')}
          {renderInput('vatPercent', 'vat Percent', '')}
          {renderCheckbox('hasCitytax', 'has Citytax', '')}
          {renderInput('cityTaxPercent', 'cityTax Percent', '')}
        </FormColumn>
      </FormWrapper>
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
