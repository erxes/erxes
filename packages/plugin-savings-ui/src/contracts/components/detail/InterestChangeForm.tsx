import {
  Button,
  ControlLabel,
  DateControl,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from "@erxes/ui/src";
import { DateContainer } from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";
import { ChangeAmount } from "../../styles";
import { IContract, IContractDoc } from "../../types";
import { __ } from "coreui/utils";
import SelectContracts, {
  Contracts,
} from "../../../contracts/components/common/SelectContract";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  onChangeDate: (date: Date) => void;
  closeModal: () => void;
  invDate: Date;
  type: string;
};

const InterestChangeForm = (props: Props) => {
  const [type, setType] = useState(props.type || "interestChange");
  const [description, setDescription] = useState("");
  const [interestAmount, setInterestAmount] = useState(0);
  const [contractId, setContractId] = useState(props.contract?._id);
  const [contract, setContract] = useState({} as IContract);

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const { contract } = props;

    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    return {
      interestAmount: Number(interestAmount),
      description: description,
      invDate: props.invDate,
      type: type,
    };
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    if (name === "interestAmount") {
      setInterestAmount(value as any);
    }
    if (name === "description") {
      setDescription(value as any);
    }
  };

  const renderRow = (label, fieldName) => {
    if (!contract) return null;
    const value = contract[fieldName] || 0;
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
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, onChangeDate } = props;
    const { values, isSubmitted } = formProps;

    const onChangeinvDate = (value) => {
      onChangeDate(value);
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
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__("Contract")}</ControlLabel>
                <SelectContracts
                  label={__("Choose an contract")}
                  name="contractId"
                  initialValue={contractId || ""}
                  onSelect={(v, n) => {
                    if (typeof v === "string") {
                      setContractId(v);
                      setContract(Contracts[v]);
                    }
                  }}
                  multi={false}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
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
