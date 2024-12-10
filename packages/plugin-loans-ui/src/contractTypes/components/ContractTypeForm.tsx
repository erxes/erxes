import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from "@erxes/ui/src/styles/eindex";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";
import { COLLATERAL_TYPE, LEASE_TYPES } from "../constants";
import { IContractType, IContractTypeDoc } from "../types";

import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { IUser } from "@erxes/ui/src/auth/types";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import Form from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { __ } from "coreui/utils";
import { ORGANIZATION_TYPE } from "../../constants";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contractType: IContractType;
  closeModal: () => void;
  currentUser: IUser;
};

const ContractTypeForm = (props: Props) => {
  const { contractType = {} as IContractType } = props;

  const [lossCalcType, setLossCalcType] = useState(
    contractType.lossCalcType || "fromInterest"
  );
  const [leaseType, setLeaseType] = useState(
    contractType.leaseType || "finance"
  );
  const [useMargin, setUseMargin] = useState(contractType.useMargin);
  const [useDebt, setUseDebt] = useState(contractType.useDebt);
  const [useSkipInterest, setUseSkipInterest] = useState(
    contractType.useSkipInterest
  );
  const [useManualNumbering, setUseManualNumbering] = useState(
    contractType.useManualNumbering
  );
  const [useFee, setUseFee] = useState(contractType.useFee);
  const [collateralType, setCollateralType] = useState(
    contractType.collateralType
  );
  const [currency, setCurrency] = useState(
    contractType.currency || props.currentUser.configs?.dealCurrency?.[0]
  );
  const [savingPlusLoanInterest, setSavingPlusLoanInterest] = useState(
    contractType.savingPlusLoanInterest
  );
  const [savingUpperPercent, setSavingUpperPercent] = useState(
    contractType.savingUpperPercent
  );
  const [invoiceDay, setInvoiceDay] = useState(contractType.invoiceDay);
  const [productId, setProductId] = useState(contractType?.productId);
  const [productType, setProductType] = useState(contractType.productType);

  const generateDoc = (values: { _id: string } & IContractTypeDoc) => {
    const finalValues = values;

    if (contractType) {
      finalValues._id = contractType._id;
    }

    return {
      _id: finalValues._id,
      code: finalValues.code,
      name: finalValues.name,
      number: finalValues.number,
      vacancy: Number(finalValues.vacancy),
      lossPercent: Number(finalValues.lossPercent),
      lossCalcType: finalValues.lossCalcType,
      useMargin,
      useDebt,
      useSkipInterest,
      leaseType,
      description: finalValues.description,
      currency: finalValues.currency,
      commitmentInterest: Number(finalValues.commitmentInterest),
      savingPlusLoanInterest: Number(savingPlusLoanInterest),
      savingUpperPercent: Number(savingUpperPercent),
      invoiceDay,
      useManualNumbering,
      useFee,
      collateralType,
      productId,
      productType,
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

    switch (name) {
      case "currency":
        setCurrency(value);
        break;
      case "leaseType":
        setLeaseType(value);
        break;
      case "collateralType":
        setCollateralType(value);
        break;
      case "invoiceDay":
        setInvoiceDay(value);
        break;
      case "lossCalcType":
        setLossCalcType(value);
        break;
      case "useDebt":
        setUseDebt(value);
        break;
      case "useMargin":
        setUseMargin(value);
        break;
      case "useSkipInterest":
        setUseSkipInterest(value);
        break;
      case "useManualNumbering":
        setUseManualNumbering(value);
        break;
      case "useFee":
        setUseFee(value);
        break;
      case "productType":
        setProductType(value);
        break;
      default:
        break;
    }
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, currentUser } = props;
    const { values, isSubmitted } = formProps;

    const onSelectProduct = (data) => {
      setProductId(data.value);
    };

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
              {renderFormGroup("Start Number", {
                ...formProps,
                name: "number",
                required: true,
                defaultValue: contractType.number || ""
              })}
              {renderFormGroup("After vacancy count", {
                ...formProps,
                name: "vacancy",
                required: true,
                type: "number",
                defaultValue: contractType.vacancy || 1,
                max: 20
              })}
            </FormColumn>
            <FormColumn>
              {renderFormGroup("Loss Percent", {
                ...formProps,
                name: "lossPercent",
                defaultValue: contractType.lossPercent || "",
                type: "number"
              })}

              <FormGroup>
                <ControlLabel required={true}>{__("Currency")}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="currency"
                  componentclass="select"
                  value={currency}
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

              <FormGroup>
                <ControlLabel>{__("Lease Type")}:</ControlLabel>

                <FormControl
                  {...props}
                  name="leaseType"
                  componentclass="select"
                  value={leaseType}
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
              {leaseType !== LEASE_TYPES.SAVING &&
                leaseType !== LEASE_TYPES.CREDIT && (
                  <FormGroup>
                    <ControlLabel>{__("Collateral type")}:</ControlLabel>
                    <FormControl
                      {...props}
                      name="collateralType"
                      componentclass="select"
                      value={collateralType}
                      required={true}
                      onChange={onChangeField}
                    >
                      {COLLATERAL_TYPE.ALL.map((typeName) => (
                        <option key={typeName} value={typeName}>
                          {typeName}
                        </option>
                      ))}
                    </FormControl>
                  </FormGroup>
                )}
              {leaseType === LEASE_TYPES.LINEAR &&
                renderFormGroup("Commitment interest", {
                  ...formProps,
                  name: "commitmentInterest",
                  required: true,
                  type: "number",
                  useNumberFormat: true,
                  value: contractType.commitmentInterest
                })}
              {leaseType === LEASE_TYPES.CREDIT &&
                renderFormGroup("Invoice day", {
                  ...formProps,
                  name: "invoiceDay",
                  required: true,
                  type: "",
                  useNumberFormat: true,
                  value: invoiceDay,
                  componentclass: "select",
                  onChange: onChangeField,
                  children: new Array(31).fill(1).map((day, index) => (
                    <option key={day} value={index + 1}>
                      {index + 1}
                    </option>
                  ))
                })}
              {currentUser?.configs?.loansConfig?.organizationType ===
                ORGANIZATION_TYPE.ENTITY && (
                  <FormGroup>
                    <ControlLabel required={true}>
                      {__("Loss calc type")}
                    </ControlLabel>
                    <FormControl
                      {...formProps}
                      name="lossCalcType"
                      componentclass="select"
                      value={lossCalcType}
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
                )}
              {leaseType === LEASE_TYPES.SAVING &&
                renderFormGroup("Saving upper interest", {
                  ...formProps,
                  name: "savingPlusLoanInterest",
                  required: true,
                  defaultValue: contractType.savingPlusLoanInterest || 0,
                  onChange: (e: any) =>
                    setSavingPlusLoanInterest(e.target.value)
                })}
              {leaseType === LEASE_TYPES.SAVING &&
                renderFormGroup("Saving upper percent", {
                  ...formProps,
                  name: "savingUpperPercent",
                  required: true,
                  max: 100,
                  defaultValue: contractType.savingUpperPercent || 0,
                  onChange: (e) => setSavingUpperPercent(e.target.value)
                })}
              {leaseType !== LEASE_TYPES.SAVING &&
                renderFormGroup("Is use debt", {
                  ...formProps,
                  className: "flex-item",
                  type: "checkbox",
                  componentclass: "checkbox",
                  name: "useDebt",
                  checked: useDebt,
                  onChange: onChangeField
                })}
              {leaseType !== LEASE_TYPES.SAVING &&
                renderFormGroup("Is use margin amount", {
                  ...formProps,
                  className: "flex-item",
                  type: "checkbox",
                  componentclass: "checkbox",
                  name: "useMargin",
                  checked: useMargin,
                  onChange: onChangeField
                })}
              {leaseType !== LEASE_TYPES.SAVING &&
                renderFormGroup("Is use skip interest", {
                  ...formProps,
                  className: "flex-item",
                  type: "checkbox",
                  componentclass: "checkbox",
                  name: "useSkipInterest",
                  checked: useSkipInterest,
                  onChange: onChangeField
                })}
              {leaseType !== LEASE_TYPES.SAVING &&
                renderFormGroup("Is use manual numbering", {
                  ...formProps,
                  className: "flex-item",
                  type: "checkbox",
                  componentclass: "checkbox",
                  name: "useManualNumbering",
                  checked: useManualNumbering,
                  onChange: onChangeField
                })}
              {leaseType !== LEASE_TYPES.SAVING &&
                renderFormGroup("Is use fee", {
                  ...formProps,
                  className: "flex-item",
                  type: "checkbox",
                  componentclass: "checkbox",
                  name: "useFee",
                  checked: useFee,
                  onChange: onChangeField
                })}
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
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
