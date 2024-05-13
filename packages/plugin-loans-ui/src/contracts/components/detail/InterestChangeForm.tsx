import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from "@erxes/ui/src/styles/eindex";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { ICloseInfo, IContract, IContractDoc } from "../../types";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import { ChangeAmount } from "../../styles";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { DateContainer } from "@erxes/ui/src/styles/main";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import Form from "@erxes/ui/src/components/form/Form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import SelectContracts from "../common/SelectContract";
import { __ } from "coreui/utils";
import client from "@erxes/ui/src/apolloClient";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { queries } from "../../../transactions/graphql";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  closeInfo: ICloseInfo;
  onChangeDate: (date: Date) => void;
  closeModal: () => void;
  invDate: Date;
  type: string;
};

const InterestChangeForm = (props: Props) => {
  const [type, setType] = useState(props.type || "stopInterest");
  const [description, setDescription] = useState("");
  const [interestAmount, setInterestAmount] = useState(0);
  const [contractId, setContractId] = useState(undefined as any);
  const [paymentInfo, setPaymentInfo] = useState(undefined as any);
  const { contract } = props;

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    return {
      contractId: finalValues._id,
      paymentInfo,
      interestAmount: Number(
        type === "stopInterest"
          ? props.closeInfo.storedInterest
          : interestAmount
      ),
      description,
      invDate: props.invDate,
      type,
    };
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    if (name === "type") {
      setType(value as any);
    }
    if (name === "contractId") {
      setContractId(value as any);
    }
    if (name === "interestAmount") {
      setInterestAmount(value as any);
    }
    if (name === "description") {
      setDescription(value as any);
    }
  };

  const renderRow = (label, fieldName) => {
    const { closeInfo } = props;
    const value = paymentInfo?.[fieldName] || closeInfo[fieldName] || 0;
    return (
      <FormWrapper>
        <FormColumn>
          <ChangeAmount>
            <ControlLabel>{__(label)}</ControlLabel>
          </ChangeAmount>
        </FormColumn>
        <FormColumn>
          <ChangeAmount>{Number(value).toLocaleString()}</ChangeAmount>
        </FormColumn>
      </FormWrapper>
    );
  };
  const renderCloseInfo = () => {
    return (
      <>
        {renderRow("Payment", "payment")}
        {renderRow("Interest", "storedInterest")}
        {renderRow("Loss", "loss")}
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, onChangeDate } = props;
    const { values, isSubmitted } = formProps;

    const onChangeinvDate = (value) => {
      onChangeDate(value);
    };

    const getPaymentInfo = (
      contractId,
      payDate: any = dayjs().locale("en").format("MMM, D YYYY")
    ) => {
      client
        .mutate({
          mutation: gql(queries.getPaymentInfo),
          variables: { id: contractId, payDate: payDate },
        })
        .then(({ data }) => {
          setPaymentInfo(data.getPaymentInfo);
        });
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__("Change Date")}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="invDate"
                    dateFormat="YYYY/MM/DD"
                    value={props.invDate}
                    onChange={onChangeinvDate}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
            {!props.type && (
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>
                    {__("Change Type")}
                  </ControlLabel>
                  <FormControl
                    {...formProps}
                    name="type"
                    componentclass="select"
                    value={type}
                    required={true}
                    onChange={onChangeField}
                  >
                    {["stopInterest", "interestChange", "interestReturn"].map(
                      (typeName, index) => (
                        <option key={index} value={typeName}>
                          {typeName}
                        </option>
                      )
                    )}
                  </FormControl>
                </FormGroup>
              </FormColumn>
            )}
            {props.type && (
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__("Contract")}</ControlLabel>
                  <SelectContracts
                    label={__("Choose an contract")}
                    name="contractId"
                    initialValue={contractId}
                    onSelect={(v, n) => {
                      onChangeField({
                        target: { name: n, value: v },
                      } as any);

                      if (contractId !== v) getPaymentInfo(v, props.invDate);
                    }}
                    multi={false}
                  />
                </FormGroup>
              </FormColumn>
            )}
          </FormWrapper>
          {type !== "stopInterest" && (
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__("Interest Change to")}</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="interestAmount"
                    type="number"
                    useNumberFormat
                    value={interestAmount || ""}
                    onChange={onChangeField}
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>
          )}
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__("Description")}</ControlLabel>
                <FormControl
                  {...formProps}
                  max={140}
                  name="description"
                  componentclass="textarea"
                  value={description || ""}
                  onChange={onChangeField}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          {renderCloseInfo()}
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__("Close")}
          </Button>

          {renderButton({
            name: "contract",
            values: generateDoc(values),
            isSubmitted,
            object: props.contract,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default InterestChangeForm;
