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
import { __ } from "coreui/utils";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  closeInfo: ICloseInfo;
  onChangeDate: (date: Date) => void;
  closeModal: () => void;
  closeDate: Date;
};

const CloseForm = (props: Props) => {
  const [closeType, setCloseType] = useState("");
  const [description, setDescription] = useState("");
  const { contract = {} as IContract } = props;

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    return {
      contractId: finalValues._id,
      description,
      closeDate: props.closeDate,
      closeType,
    };
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    if (name === "closeType") {
      setCloseType(value);
    }
    if (name === "description") {
      setDescription(value);
    }
  };

  const renderRow = (label, fieldName) => {
    const { closeInfo } = props;
    const value = closeInfo[fieldName] || 0;
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
        {renderRow("Total", "total")}
        {renderRow("Balance", "balance")}
        {renderRow("Payment", "payment")}
        {renderRow("Interest", "interest")}
        {renderRow("Loss", "loss")}
        {renderRow("Insurance", "insurance")}
        {renderRow("Debt", "debt")}
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, onChangeDate } = props;
    const { values, isSubmitted } = formProps;

    const onChangeCloseDate = (value) => {
      onChangeDate(value);
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__("Close Date")}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    dateFormat="YYYY/MM/DD"
                    name="closeDate"
                    value={props.closeDate}
                    onChange={onChangeCloseDate}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__("Close Type")}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="closeType"
                  componentclass="select"
                  value={closeType}
                  required={true}
                  onChange={onChangeField}
                >
                  {["value0", "changeCondition", "cantPay"].map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {typeName}
                      </option>
                    )
                  )}
                </FormControl>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
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

export default CloseForm;
