import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import Form from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import { IFormProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import { BANK_CODES } from "../.././../constants";
import { IGolomtBankAccount } from "../../../types/IGolomtAccount";

type Props = {
  configId: string;
  accounts?: IGolomtBankAccount[];
  accountNumber?: string;
  submit: ({
    configId,
    fromAccount,
    toAccount,
    toAccountName,
    toBank,
    toCurrency,
    toDescription,
    fromDescription,
    fromCurrency,
    toAmount,
    fromAmount,
    refCode,
  }) => void;
  closeModal: () => void;
};

const TransactionForm = (props: Props) => {
  const { accountNumber } = props;
  const [refCode, setRefCode] = useState("");
  const [fromAccount, setFromAccount] = useState(accountNumber || "");
  const [toAccount, setToAccount] = useState("");
  const [toBank, setToBank] = useState("15");
  const [fromDescription, setFromDescription] = useState("");
  const [toDescription, setToDescription] = useState("");
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [toAccountName, setToAccountName] = useState("");

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, configId } = props;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__("receipt number")}</ControlLabel>
          <FormControl
            required={true}
            value={refCode}
            placeholder="receipt number"
            onChange={(e: any) => setRefCode(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Account Number")}</ControlLabel>
          <FormControl
            value={fromAccount}
            placeholder="Account number"
            onChange={(e: any) => setFromAccount(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__(" from amount")}</ControlLabel>
          <FormControl
            value={fromAmount}
            type="number"
            placeholder="from amount"
            onChange={(e: any) => setFromAmount(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Description")}</ControlLabel>
          <FormControl
            required={true}
            value={fromDescription}
            placeholder="from description"
            onChange={(e: any) => setFromDescription(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("from currency")}</ControlLabel>
          <FormControl
            required={true}
            value={fromCurrency}
            placeholder="from currency"
            onChange={(e: any) => setFromCurrency(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__("to Account number")}</ControlLabel>
          <FormControl
            placeholder=" receive Account number"
            value={toAccount}
            onChange={(e: any) => setToAccount(e.target.value)}
            className="select"
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__(" to amount")}</ControlLabel>
          <FormControl
            value={toAmount}
            type="number"
            placeholder="to amount"
            onChange={(e: any) => setToAmount(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Bank</ControlLabel>
          <FormControl
            {...formProps}
            id="toBank"
            name="toBank"
            componentclass="select"
            required={true}
            defaultValue={toBank}
            onChange={(e: any) => setToBank(e.target.value)}
          >
            <option value="">Select bank</option>
            {BANK_CODES.map((bank) => (
              <option key={bank.value} value={bank.value}>
                {bank.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("To Description")}</ControlLabel>
          <FormControl
            required={true}
            value={toDescription}
            placeholder="to description"
            onChange={(e: any) => setToDescription(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("account name")}</ControlLabel>
          <FormControl
            value={toAccountName}
            placeholder="to Account Name"
            onChange={(e: any) => setToAccountName(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("to currency")}</ControlLabel>
          <FormControl
            required={true}
            value={toCurrency}
            placeholder="to currency"
            onChange={(e: any) => setToCurrency(e.target.value)}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="success"
            icon="check-circle"
            type="submit"
            onClick={() => {
              props.submit({
                configId,
                fromAccount,
                toAccount,
                toAccountName,
                toBank,
                toCurrency,
                toDescription,
                fromDescription,
                fromCurrency,
                toAmount,
                fromAmount,
                refCode,
              });
            }}
          >
            Submit{" "}
          </Button>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel{" "}
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TransactionForm;
