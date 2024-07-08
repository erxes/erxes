import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter
} from "@erxes/ui/src";
import React from "react";
import { IConfigsMap } from "../types";
import { __ } from "coreui/utils";

type Props = {
  configsMap: IConfigsMap;
  config: any;
  save: (configsMap: IConfigsMap) => void;
  loading: boolean;
};

type State = {
  config: any;
  hasOpen: boolean;
};

class MainConfig extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config || {},
      hasOpen: false
    };
  }

  onSave = (e) => {
    e.preventDefault();
    const { config } = this.state;
    const { configsMap } = this.props;
    configsMap.savingConfig = config;
    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    config[code] = value;
    this.setState({ config });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangeInputNumber = (code: string, e) => {
    this.onChangeConfig(code, Number(e.target.value));
  };

  onChangeCheck = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  render() {
    const { config } = this.state;
    return (
      <>
        <CollapseContent title={__(config.title)} open={false}>
          <FormGroup>
            <ControlLabel>{__("Calculation number fixed")}</ControlLabel>
            <FormControl
              defaultValue={config["calculationFixed"]}
              type="number"
              min={0}
              max={100}
              onChange={this.onChangeInput.bind(this, "calculationFixed")}
              required={true}
            />
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle="primary"
              icon="check-circle"
              onClick={this.onSave}
              uppercase={false}
              disabled={this.props.loading}
            >
              {__("Save")}
            </Button>
          </ModalFooter>
        </CollapseContent>
        <CollapseContent title={__("period lock config")} open={false}>
          <FormGroup>
            <ControlLabel required={true}>
              {__("Period lock type")}
            </ControlLabel>
            <FormControl
              name="periodLockType"
              componentclass="select"
              type="select"
              defaultValue={config["periodLockType"]}
              onChange={this.onChangeInput.bind(this, "periodLockType")}
            >
              {["daily", "endOfMonth", "manual"].map((typeName) => (
                <option key={typeName} value={typeName}>
                  {__(typeName)}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Is Store Interest")}</ControlLabel>
            <FormControl
              className="flex-item"
              type="checkbox"
              componentclass="checkbox"
              name="isStoreInterest"
              checked={config["isStoreInterest"]}
              onChange={this.onChangeCheck.bind(this, "isStoreInterest")}
            />
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle="primary"
              icon="check-circle"
              onClick={this.onSave}
              uppercase={false}
              disabled={this.props.loading}
            >
              {__("Save")}
            </Button>
          </ModalFooter>
        </CollapseContent>
        <CollapseContent title={__("internet bank config")} open={false}>
          <FormGroup>
            <ControlLabel>{__("one time transaction limit")}</ControlLabel>
            <FormControl
              defaultValue={config["oneTimeTransactionLimit"]}
              type="number"
              onChange={this.onChangeInputNumber.bind(
                this,
                "oneTimeTransactionLimit"
              )}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Transaction account type")}</ControlLabel>
            <FormControl
              name="transactionAccountType"
              componentclass="select"
              defaultValue={config["transactionAccountType"]}
              onChange={this.onChangeInput.bind(this, "transactionAccountType")}
            >
              {["khanbank", "golomt"].map((typeName) => (
                <option key={`${typeName}bank`} value={typeName}>
                  {__(typeName)}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Transaction account number")}</ControlLabel>
            <FormControl
              defaultValue={config["transactionAccountNumber"]}
              type="number"
              onChange={this.onChangeInputNumber.bind(
                this,
                "transactionAccountNumber"
              )}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("transaction Config")}</ControlLabel>
            <FormControl
              defaultValue={config["transactionConfigId"]}
              type="password"
              onChange={this.onChangeInput.bind(
                this,
                "transactionConfigId"
              )}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Transaction Login Name")}</ControlLabel>
            <FormControl
              defaultValue={config["transactionLoginName"]}
              type="password"
              onChange={this.onChangeInput.bind(
                this,
                "transactionLoginName"
              )}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Transaction password")}</ControlLabel>
            <FormControl
              defaultValue={config["transactionPassword"]}
              type="password"
              onChange={this.onChangeInput.bind(
                this,
                "transactionPassword"
              )}
              required={true}
            />
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle="primary"
              icon="check-circle"
              onClick={this.onSave}
              uppercase={false}
              disabled={this.props.loading}
            >
              {__("Save")}
            </Button>
          </ModalFooter>
        </CollapseContent>
        <CollapseContent title={__("Block config")} open={false}>
          <FormGroup>
            <ControlLabel>{__("block limit")}</ControlLabel>
            <FormControl
              defaultValue={config["blockLimit"]}
              type="number"
              onChange={this.onChangeInputNumber.bind(this, "blockLimit")}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Block end day")}</ControlLabel>
            <FormControl
              name="blockEndDay"
              componentclass="select"
              defaultValue={config["blockEndDay"]}
              onChange={this.onChangeInput.bind(this, "blockEndDay")}
            >
              {new Array(31).fill(1).map((number, index) => (
                <option key={`${index + number}bank`} value={index + number}>
                  {__((index + number).toString())}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle="primary"
              icon="check-circle"
              onClick={this.onSave}
              uppercase={false}
              disabled={this.props.loading}
            >
              {__("Save")}
            </Button>
          </ModalFooter>
        </CollapseContent>
      </>
    );
  }
}
export default MainConfig;
