import {
  Button,
  ControlLabel,
  DateControl,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  __,
} from "@erxes/ui/src";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { INonBalanceTransaction, INonBalanceTransactionDoc } from "../types";
import { DateContainer } from "@erxes/ui/src/styles/main";
import React, { useState } from "react";
import SelectContracts, {
  Contracts,
} from "../../contracts/components/common/SelectContract";

import { detailTypeList } from "../utils";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  NonBalanceTransaction: INonBalanceTransaction;
  closeModal: () => void;
};

export default function AddTransactionForm(props: Props) {
  const { NonBalanceTransaction } = props;
  const [contractId, setcontractId] = useState(
    NonBalanceTransaction.contractId || ""
  );
  const [customerId, setcustomerId] = useState(
    NonBalanceTransaction.customerId || ""
  );
  const [description, setDescription] = useState(
    NonBalanceTransaction.description || ""
  );
  const [isDedit, setDedit] = useState(false);
  const [detailType, setdetailType] = useState("interest");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("");
  const [nonBalanceDate, setDate] = useState(new Date());

  const generateDoc = (values: { _id: string } & INonBalanceTransactionDoc) => {
    const finalValues = values;
    let addDetail: any = {};
    isDedit ? (addDetail.dtAmount = amount) : (addDetail.ktAmount = amount);
    addDetail.type = detailType;
    addDetail.currency = currency;
    finalValues.contractId = contractId || "";
    finalValues.customerId = customerId;
    finalValues.description = description;
    finalValues.transactionType = detailType;
    finalValues.detail = [addDetail];
    finalValues.detail = [addDetail];
    finalValues.nonBalanceDate = nonBalanceDate;
    return finalValues;
  };

  const onFieldClick = (e) => {
    e.target.select();
  };

  const onChangeDate = (date: any) => {
    console.log("onChangeDate:::", onChangeDate);
    //setDate(date);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;
    const detailTypeOptions = detailTypeList.map((f) => ({
      value: f.value,
      label: f.label,
    }));

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__("Contract")}</ControlLabel>
                <SelectContracts
                  label={__("Choose an contract")}
                  name="contractId"
                  initialValue={contractId}
                  onSelect={(v) => {
                    if (typeof v === "string") {
                      setcustomerId(Contracts[v].customerId);
                      setCurrency(Contracts[v].currency);
                      setcontractId(v);
                    }
                  }}
                  multi={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>{__("type")}</ControlLabel>
                <FormControl
                  placeholder={__("Choose detail type")}
                  name="detailType"
                  options={detailTypeOptions.map((f) => ({
                    value: f.value,
                    label: f.label,
                  }))}
                  value={detailType}
                  componentclass="select"
                  onChange={(e: any) => setdetailType(e.target.value)}
                  required={true}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__("Is debit")}</ControlLabel>
                <FormControl
                  {...formProps}
                  type={"checkbox"}
                  componentclass="checkbox"
                  useNumberFormat
                  fixed={0}
                  name="isDedit"
                  value={isDedit}
                  onChange={(e: any) => setDedit(e.target.value)}
                  onClick={onFieldClick}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__("Amount")}</ControlLabel>
                <FormControl
                  {...formProps}
                  type={"number"}
                  useNumberFormat
                  fixed={2}
                  name="amount"
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  onClick={onFieldClick}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__("Description")}</ControlLabel>
                <DateContainer>
                  <FormControl
                    {...formProps}
                    required={false}
                    name="description"
                    value={description}
                    onChange={(e: any) => setDescription(e.target.value)}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={() => closeModal()}
            icon="cancel-1"
          >
            {__("Close")}
          </Button>
          {renderButton({
            name: "nonBalanceTransaction",
            values: generateDoc(values),
            isSubmitted,
            object: props.NonBalanceTransaction,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
