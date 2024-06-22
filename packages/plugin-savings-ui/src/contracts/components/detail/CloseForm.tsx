import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import Form from "@erxes/ui/src/components/form/Form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";

import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from "@erxes/ui/src/styles/eindex";

import Info from "@erxes/ui/src/components/Info";
import { DateContainer } from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";
import { ChangeAmount } from "../../styles";
import { ICloseInfo, IContract, IContractDoc } from "../../types";
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
  const { contract, closeDate } = props;

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    return {
      contractId: finalValues._id,
      description,
      closeDate,
      closeType,
    };
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    if (name === "description") {
      setDescription(value);
    }
    if (name === "closeType") {
      setCloseType(value);
    }
  };

  const onFieldClick = (e) => {
    e.target.select();
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
        {renderRow("Saving Amount", "savingAmount")}
        {renderRow("Stored Interest", "storedInterest")}
        {renderRow("Total", "total")}
        {!!props.contract.loansOfForeclosed?.length && (
          <Info type="danger" title="Анхаар">
            This saving is collateraled on Loans
          </Info>
        )}
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
                    dateFormat={"YYYY/MM/DD"}
                    name="closeDate"
                    value={props.closeDate}
                    onChange={onChangeCloseDate}
                  />
                </DateContainer>
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
