import { IUser } from "@erxes/ui/src/auth/types";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import Form from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from "@erxes/ui/src/styles/eindex";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { __ } from "coreui/utils";
import React, { useState } from "react";
import { LEASE_TYPES } from "../constants";
import { IContractType, IContractTypeDoc } from "../types";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contractType?: IContractType;
  closeModal: () => void;
  currentUser: IUser;
};

const ContractTypeForm = (props: Props) => {
  const [contractType, setContractType] = useState(props.contractType || {} as IContractType);

  const generateDoc = (values: { _id: string } & IContractTypeDoc) => {
    const finalValues = values;

    if (props.contractType) {
      finalValues._id = props.contractType._id;
    }

    return {
      ...contractType,
      _id: finalValues._id,
      vacancy: Number(contractType.vacancy || 0),
      defaultInterest: Number(contractType.defaultInterest || 0),
      skipInterestDay: Number(contractType.skipInterestDay || 0),
      skipInterestMonth: Number(contractType.skipInterestMonth || 0),
      skipPaymentDay: Number(contractType.skipPaymentDay || 0),
      skipPaymentMonth: Number(contractType.skipPaymentMonth || 0),
      lossPercent: Number(contractType.lossPercent || 0),
      skipLossDay: Number(contractType.skipLossDay || 0),
      allowLateDay: Number(contractType.allowLateDay || 0),
      commitmentInterest: Number(contractType.commitmentInterest || 0),
      savingPlusLoanInterest: Number(contractType.savingPlusLoanInterest || 0),
      savingUpperPercent: Number(contractType.savingUpperPercent || 0),
      feePercent: Number(contractType.feePercent || 0),
      defaultFee: Number(contractType.defaultFee || 0),
    };
  };

  const renderFormGroup = (label, props) => {
    if (props.type === "checkbox")
      return (
        <FormGroup>
          <FormControl {...props} />
          <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        </FormGroup>
      );
    return (
      <FormGroup>
        <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setContractType({ ...contractType, [name]: value })
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, currentUser } = props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {renderFormGroup("Code", {
                ...formProps,
                name: "code",
                required: true,
                defaultValue: contractType.code || ""
              })}
              {renderFormGroup("Name", {
                ...formProps,
                name: "name",
                required: true,
                defaultValue: contractType.name || ""
              })}
              <FormGroup>
                <ControlLabel required={true}>{__("Currency")}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="currency"
                  componentclass="select"
                  value={contractType.currency}
                  required={true}
                  onChange={onChangeField}
                >
                  {props.currentUser.configs?.dealCurrency?.map((typeName) => (
                    <option key={typeName} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              {renderFormGroup("Start Number", {
                ...formProps,
                name: "number",
                required: true,
                defaultValue: contractType.number || "",
                onChange: onChangeField
              })}
              {renderFormGroup("After vacancy count", {
                ...formProps,
                name: "vacancy",
                required: true,
                type: "number",
                defaultValue: contractType.vacancy || 1,
                max: 20,
                onChange: onChangeField
              })}
              {renderFormGroup("Is use manual numbering", {
                ...formProps,
                className: "flex-item",
                type: "checkbox",
                componentclass: "checkbox",
                name: "useManualNumbering",
                checked: contractType.useManualNumbering,
                onChange: onChangeField
              })}
              {renderFormGroup("Default Interest in Year", {
                ...formProps,
                name: "defaultInterest",
                type: "number",
                value: contractType.defaultInterest || 0,
                onChange: onChangeField
              })}
              {renderFormGroup("Default Interest in Month", {
                ...formProps,
                name: "defaultInterestInMonth",
                type: "number",
                value: (contractType.defaultInterest || 0) / 12,
                onChange: (e => setContractType({ ...contractType, 'defaultInterest': (e.target as any).value * 12 }))
              })}
              {renderFormGroup("Fee percent of lease Amount", {
                ...formProps,
                name: "feePercent",
                type: "number",
                defaultValue: contractType.feePercent || 0,
                onChange: onChangeField
              })}
              {renderFormGroup("Static default fee amount", {
                ...formProps,
                name: "defaultFee",
                type: "number",
                defaultValue: contractType.defaultFee || 0,
                onChange: onChangeField
              })}
            </FormColumn>
            <FormColumn>
              {renderFormGroup("Loss Percent", {
                ...formProps,
                name: "lossPercent",
                defaultValue: contractType.lossPercent || "",
                type: "number",
                onChange: onChangeField
              })}
              <FormGroup>
                <ControlLabel required={true}>
                  {__("Loss calc type")}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="lossCalcType"
                  componentclass="select"
                  value={contractType.lossCalcType}
                  required={true}
                  onChange={onChangeField}
                >
                  {[
                    "fromInterest",
                    "fromAmount",
                    "fromTotalPayment",
                    "fromEndAmount"
                  ].map((typeName) => (
                    <option key={`undeType${typeName}`} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              {renderFormGroup("skip Loss Day", {
                ...formProps,
                name: "skipLossDay",
                required: true,
                type: "number",
                defaultValue: contractType.skipLossDay || 0,
                onChange: onChangeField
              })}
              {renderFormGroup("allow Late Day", {
                ...formProps,
                name: "allowLateDay",
                required: true,
                type: "number",
                defaultValue: contractType.allowLateDay || 0,
                onChange: onChangeField
              })}

              {renderFormGroup("allow Part Of Lease", {
                ...formProps,
                className: "flex-item",
                type: "checkbox",
                componentclass: "checkbox",
                name: "allowPartOfLease",
                checked: contractType.allowPartOfLease,
                onChange: onChangeField
              })}
              {contractType.allowPartOfLease && (
                <>
                  {renderFormGroup("limit Is Current", {
                    ...formProps,
                    className: "flex-item",
                    type: "checkbox",
                    componentclass: "checkbox",
                    name: "limitIsCurrent",
                    checked: contractType.limitIsCurrent,
                    onChange: onChangeField
                  })}
                  {renderFormGroup("Commitment interest", {
                    ...formProps,
                    name: "commitmentInterest",
                    required: true,
                    type: "number",
                    useNumberFormat: true,
                    value: contractType.commitmentInterest,
                    onChange: onChangeField
                  })}
                </>
              )}
              {renderFormGroup("Is use skip interest", {
                ...formProps,
                className: "flex-item",
                type: "checkbox",
                componentclass: "checkbox",
                name: "useSkipInterest",
                checked: contractType.useSkipInterest,
                onChange: onChangeField
              })}
              {contractType.useSkipInterest &&
                (<>
                  {renderFormGroup("skip Interest Day", {
                    ...formProps,
                    name: "skipInterestDay",
                    required: true,
                    type: "number",
                    defaultValue: contractType.skipInterestDay || 0,
                    onChange: onChangeField
                  })}
                  {renderFormGroup("skip Interest Month", {
                    ...formProps,
                    name: "skipInterestMonth",
                    required: true,
                    type: "number",
                    defaultValue: contractType.skipInterestMonth || 0,
                    onChange: onChangeField
                  })}
                  {renderFormGroup("skip Payment Day", {
                    ...formProps,
                    name: "skipPaymentDay",
                    required: true,
                    type: "number",
                    defaultValue: contractType.skipPaymentDay || 0,
                    onChange: onChangeField
                  })}
                  {renderFormGroup("skip Payment Month", {
                    ...formProps,
                    name: "skipPaymentMonth",
                    required: true,
                    type: "number",
                    defaultValue: contractType.skipPaymentMonth || 0,
                    onChange: onChangeField
                  })}
                </>)
              }
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__("Lease Type")}:</ControlLabel>
                <FormControl
                  {...props}
                  name="leaseType"
                  componentclass="select"
                  value={contractType.leaseType}
                  required={true}
                  onChange={onChangeField}
                >
                  {LEASE_TYPES.ALL.map((typeName) => (
                    <option key={typeName} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>

              {contractType.leaseType === LEASE_TYPES.SAVING && (
                <>
                  {renderFormGroup("Saving upper interest", {
                    ...formProps,
                    name: "savingPlusLoanInterest",
                    required: true,
                    defaultValue: contractType.savingPlusLoanInterest || 0,
                    onChange: onChangeField
                  })}
                  {
                    renderFormGroup("Saving upper percent", {
                      ...formProps,
                      name: "savingUpperPercent",
                      required: true,
                      max: 100,
                      defaultValue: contractType.savingUpperPercent || 0,
                      onChange: onChangeField
                    })}
                </>
              ) || (
                  <>
                    {renderFormGroup("Is use debt", {
                      ...formProps,
                      className: "flex-item",
                      type: "checkbox",
                      componentclass: "checkbox",
                      name: "useDebt",
                      checked: contractType.useDebt,
                      onChange: onChangeField
                    })}
                    {renderFormGroup("Is use margin amount", {
                      ...formProps,
                      className: "flex-item",
                      type: "checkbox",
                      componentclass: "checkbox",
                      name: "useMargin",
                      checked: contractType.useMargin,
                      onChange: onChangeField
                    })}
                    {contractType.useMargin &&
                      (<>
                        {renderFormGroup("min margin and lease amounts ratio", {
                          ...formProps,
                          name: "minPercentMargin",
                          required: true,
                          type: "number",
                          defaultValue: contractType.minPercentMargin || 0,
                          onChange: onChangeField
                        })}
                      </>)
                    }
                  </>
                )}
              {renderFormGroup("Is use collateral", {
                ...formProps,
                className: "flex-item",
                type: "checkbox",
                componentclass: "checkbox",
                name: "useCollateral",
                checked: contractType.useCollateral,
                onChange: onChangeField
              })}
              {renderFormGroup("Over payment is overrate next schedule", {
                ...formProps,
                className: "flex-item",
                type: "checkbox",
                componentclass: "checkbox",
                name: "overPaymentIsNext",
                checked: contractType.overPaymentIsNext,
                onChange: onChangeField
              })}
              <FormGroup>
                <ControlLabel required={true}>
                  {__("Collectivity rule")}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="collectivelyRule"
                  componentclass="select"
                  value={contractType.collectivelyRule}
                  required={true}
                  onChange={onChangeField}
                >
                  {[
                    "free",
                    "must",
                    "not",
                  ].map((typeName) => (
                    <option key={`collectivelyRule${typeName}`} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              {renderFormGroup("Description", {
                ...formProps,
                name: "description",
                max: 140,
                componentclass: "textarea",
                defaultValue: contractType.description || ""
              })}
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__("Close")}
          </Button>

          {renderButton({
            name: "contractType",
            values: generateDoc(values),
            isSubmitted,
            object: props.contractType
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ContractTypeForm;
