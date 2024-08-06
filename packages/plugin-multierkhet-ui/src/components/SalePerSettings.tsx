import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Tip
} from "@erxes/ui/src/components";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import { __ } from "@erxes/ui/src/utils";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import Select from "react-select";
import React, { useState, useEffect } from "react";
import { IConfigsMap } from "../types";
import { FieldsCombinedByType } from "@erxes/ui-forms/src/settings/properties/types";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { queries as formQueries } from "@erxes/ui-forms/src/forms/graphql";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import { GroupWrapper } from "@erxes/ui-segments/src/styles";

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings = (props: Props) => {
  const [config, setConfig] = useState(props.config);
  const [brandRules, setBrandRules] = useState(props.config.brandRules || {});
  const [fieldsCombined, setFieldsCombined] = useState(
    [] as FieldsCombinedByType[]
  );
  const { configsMap, currentConfigKey } = props;

  useEffect(() => {
    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        variables: {
          contentType: "sales:deal"
        }
      })
      .then(({ data }) => {
        setFieldsCombined(data ? data.fieldsCombinedByContentType : [] || []);
      });
  }, [fieldsCombined]);

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

    delete configsMap.stageInSaleConfig[currentConfigKey];
    configsMap.stageInSaleConfig[key] = { ...config, brandRules };
    props.save(configsMap);
  };

  const onDelete = e => {
    e.preventDefault();

    props.delete(props.currentConfigKey);
  };

  const onChangeCheckbox = (code: string, e) => {
    onChangeConfig(code, e.target.checked);
  };

  const onChangeConfig = (code: string, value) => {
    config[code] = value;
    setConfig(config);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onresponseCustomFieldChange = option => {
    const value = !option ? "" : option.value.toString();
    onChangeConfig("responseField", value);
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
          componentclass="checkbox"
          checked={config[key]}
          onChange={onChangeCheckbox.bind(this, key)}
        />
      </FormGroup>
    );
  };

  const addConfig = () => {
    setBrandRules({
      ...brandRules,
      newBrand: {
        brandId: "",
        userEmail: "",
        hasPayment: true,
        hasVat: false,
        hasCitytax: false,
        defaultPay: "debtAmount"
      }
    });
  };

  const removeConfig = brandId => {
    const newConfig = { ...brandRules };
    delete newConfig[brandId];
    setBrandRules(newConfig);
  };

  const updateConfig = (brandId, key, value, test?) => {
    setBrandRules(prevBrandRules => {
      const newBrandRules = { ...prevBrandRules };

      if (key === "brandId") {
        delete newBrandRules.newBrand;
      }
      if (brandId !== test) {
        delete newBrandRules[test];
      }

      newBrandRules[brandId] = { ...newBrandRules[brandId], [key]: value };

      return newBrandRules;
    });
  };

  const renderPerConfig = () => {
    const options = [
      { value: "debtAmount", label: "debtAmount" },
      { value: "cashAmount", label: "cashAmount" },
      { value: "cardAmount", label: "cardAmount" }
    ];

    return Object.keys(brandRules).map(key => {
      return (
        <GroupWrapper key={key}>
          <FormGroup>
            <ControlLabel>Brand</ControlLabel>
            <SelectBrands
              label={__("Choose brands")}
              initialValue={brandRules[key].brandId}
              name="brandId"
              customOption={{
                label: "No Brand (noBrand)",
                value: "noBrand"
              }}
              onSelect={brand => updateConfig(brand, "brandId", brand, key)}
              multi={false}
            />
          </FormGroup>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>User Email</ControlLabel>
                <FormControl
                  value={brandRules[key].userEmail}
                  onChange={e =>
                    updateConfig(key, "userEmail", (e.target as any).value)
                  }
                  required={true}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Has Vat</ControlLabel>
                <FormControl
                  componentclass="checkbox"
                  checked={brandRules[key].hasVat}
                  onChange={e =>
                    updateConfig(key, "hasVat", (e.target as any).checked)
                  }
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Default Pay</ControlLabel>
                <Select
                  value={options.find(
                    o => o.value === brandRules[key].defaultPay
                  )}
                  onChange={(option: any) =>
                    updateConfig(key, "defaultPay", option.value)
                  }
                  isClearable={false}
                  required={true}
                  options={options}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Has Citytax</ControlLabel>
                <FormControl
                  componentclass="checkbox"
                  checked={brandRules[key].hasCitytax}
                  onChange={e =>
                    updateConfig(key, "hasCitytax", (e.target as any).checked)
                  }
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <Tip text={"Delete"}>
            <Button
              btnStyle="simple"
              size="small"
              onClick={removeConfig.bind(this, key)}
              icon="times"
            />
          </Tip>
        </GroupWrapper>
      );
    });
  };

  const responseFieldOptions = (fieldsCombined || []).map(f => ({
    value: f.name,
    label: f.label
  }));

  return (
    <CollapseContent
      title={__(config.title)}
      open={props.currentConfigKey === "newStageInSaleConfig" ? true : false}
    >
      <FormWrapper>
        <FormColumn>
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
          {renderCheckbox("hasPayment", "has Payment")}
          <FormGroup>
            <ControlLabel>{__("Choose response field")}</ControlLabel>
            <Select
              name="responseField"
              value={responseFieldOptions.find(
                o => o.value === config.responseField
              )}
              onChange={onresponseCustomFieldChange}
              isClearable={true}
              options={responseFieldOptions}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>{renderPerConfig()}</FormColumn>
      </FormWrapper>
      <ModalFooter>
        <Button
          btnStyle="primary"
          onClick={addConfig}
          icon="plus"
          uppercase={false}
        >
          Add config
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
