import React, { useState } from "react";
import { isEnabled } from "@erxes/ui/src/utils/core";
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  Toggle,
} from "@erxes/ui/src";
import {
  Block,
  BlockRow,
  BlockRowUp,
  FlexColumn,
  FlexItem,
} from "../../../styles";
import { LeftItem } from "@erxes/ui/src/components/step/styles";
import { IPos } from "../../../types";
import Select from "react-select";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";

type Props = {
  onChange: (
    name: "pos" | "erkhetConfig" | "checkRemainder",
    value: any
  ) => void;
  pos: IPos;
  checkRemainder: boolean;
};

const ErkhetConfig = (props: Props) => {
  const { pos, onChange } = props;

  const [config, setConfig] = useState<any>(
    pos && pos.erkhetConfig
      ? pos.erkhetConfig
      : {
          isSyncErkhet: false,
          userEmail: "",
          defaultPay: "",
          getRemainder: false,
        }
  );

  const [checkRemainder, setCheckRemainder] = useState<boolean>(
    props.checkRemainder
  );

  const onChangeConfig = (code: string, value) => {
    const newConfig = { ...config, [code]: value };

    setConfig(newConfig);
    onChange("erkhetConfig", newConfig);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onChangeInputSub = (code: string, key1: string, e) => {
    onChangeConfig(code, { ...config[code], [key1]: e.target.value });
  };

  const onChangeSwitch = (e) => {
    onChangeConfig("isSyncErkhet", e.target.checked);
  };

  const onChangeSwitchCheckErkhet = (e) => {
    let val = e.target.checked;
    if (!config.isSyncErkhet) {
      val = false;
    }

    if (val && checkRemainder) {
      onChange("checkRemainder", false);
      setCheckRemainder(false);
    }

    onChangeConfig("getRemainder", val);
  };

  const onChangeSwitchCheckInv = (e) => {
    let val = e.target.checked;
    if (!isEnabled("inventories")) {
      val = false;
    }

    if (val && config.getRemainder) {
      onChangeConfig("getRemainder", false);
    }

    onChange("checkRemainder", val);
    setCheckRemainder(val);
  };

  const onChangeSelect = (key, option) => {
    onChangeConfig(key, option.value);
  };

  const renderInput = (
    key: string,
    title?: string,
    description?: string,
    type?: string
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          type={type || "text"}
          onChange={onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  const renderInputSub = (
    key: string,
    key1: string,
    title: string,
    description?: string,
    type?: string
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={(config[key] && config[key][key1]) || ""}
          type={type || "text"}
          onChange={onChangeInputSub.bind(this, key, key1)}
          required={true}
        />
      </FormGroup>
    );
  };

  const renderAccLoc = () => {
    if (!pos.isOnline) {
      return (
        <BlockRow>
          {renderInput("account", "Account", "")}
          {renderInput("location", "Location", "")}
        </BlockRow>
      );
    }

    return (
      <>
        {(pos.allowBranchIds || []).map((branchId) => {
          return (
            <BlockRow key={branchId}>
              <FormGroup>
                <ControlLabel>Branch</ControlLabel>
                <SelectBranches
                  label={__("Choose branch")}
                  name="branchId"
                  initialValue={branchId}
                  onSelect={() => {}}
                  multi={false}
                />
              </FormGroup>
              {renderInputSub(`${branchId}`, "account", "Account", "")}
              {renderInputSub(`${branchId}`, "location", "Location", "")}
            </BlockRow>
          );
        })}
      </>
    );
  };

  const renderSelectType = (key, value) => {
    const options = [
      { value: "debtAmount", label: "debt Amount" },
      { value: "cashAmount", label: "cash Amount" },
      { value: "cardAmount", label: "card Amount" },
      { value: "card2Amount", label: "card2 Amount" },
      { value: "mobileAmount", label: "mobile Amount" },
      { value: "debtBarterAmount", label: "barter Amount" },
    ];
    return (
      <Select
        key={Math.random()}
        value={options.find((o) => o.value === (value || ""))}
        onChange={onChangeSelect.bind(this, key)}
        isClearable={false}
        required={true}
        options={options}
      />
    );
  };

  const renderOther = () => {
    if (!config.isSyncErkhet) {
      return <></>;
    }

    return (
      <Block>
        <h4>{__("Other")}</h4>
        <BlockRow>
          {renderInput("userEmail", "user Email", "")}
          {renderInput("beginNumber", "Begin bill number", "")}
          <FormGroup>
            <ControlLabel>{"defaultPay"}</ControlLabel>
            {renderSelectType("defaultPay", config.defaultPay)}
          </FormGroup>
        </BlockRow>
        {renderAccLoc()}
        <BlockRow>
          {(pos.paymentTypes || []).map((pt) => (
            <FormGroup key={pt.type}>
              <ControlLabel>{pt.title}</ControlLabel>
              {renderSelectType(`_${pt.type}`, config[`_${pt.type}`])}
            </FormGroup>
          ))}
        </BlockRow>
      </Block>
    );
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>
            <h4>{__("Main")}</h4>
            <BlockRow>
              <FormGroup>
                <ControlLabel>Is Sync erkhet</ControlLabel>
                <Toggle
                  id={"isSyncErkhet"}
                  checked={config.isSyncErkhet || false}
                  onChange={onChangeSwitch}
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>,
                  }}
                />
              </FormGroup>
            </BlockRow>
          </Block>

          {renderOther()}

          <Block>
            <h4>{__("Remainder")}</h4>
            <BlockRow>
              <FormGroup>
                <ControlLabel>Check erkhet</ControlLabel>
                <Toggle
                  id={"getRemainder"}
                  checked={config.getRemainder || false}
                  onChange={onChangeSwitchCheckErkhet}
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>,
                  }}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Check inventories</ControlLabel>
                <Toggle
                  id={"checkRemainder"}
                  checked={checkRemainder}
                  onChange={onChangeSwitchCheckInv}
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>,
                  }}
                />
              </FormGroup>
            </BlockRow>
          </Block>
          <Block />
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default ErkhetConfig;
