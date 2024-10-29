import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import Form from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import { IFormProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import { BANK_CODES, TRANSACTION_TYPES } from "../.././../constants";
import { IGolomtBankAccount } from "../../../types/IGolomtAccount";
import { IGolomtBankTransactionInput } from "../../../types/ITransactions";

type Props = {
  configId: string;
  accounts?: IGolomtBankAccount[];
  accountNumber?: string;
  accountName: string;
  submit: (transfer: IGolomtBankTransactionInput) => void;
  closeModal: () => void;
};

const TransactionForm = (props: Props) => {
  const { accountNumber, accountName } = props;

  const [refCode, setRefCode] = useState("");
  const [fromAccount, setFromAccount] = useState(accountNumber || "");
  const [toAccount, setToAccount] = useState("");
  const [toBank, setToBank] = useState("15");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [fromCurrency, setFromCurrency] = useState("MNT");
  const [toCurrency, setToCurrency] = useState("MNT");
  const [toAccountName, setToAccountName] = useState("");
  const [fromAccountName, setFromAccountName] = useState(accountName || "");
  const [type, setType] = useState("TSF");

  const renderContent = (formProps: IFormProps) => {
    const { closeModal } = props;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__("ref number")}</ControlLabel>
          <FormControl
            required={true}
            value={refCode}
            placeholder={__("ref number")}
            onChange={(e: any) => setRefCode(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Type</ControlLabel>
          <FormControl
            {...formProps}
            id="type"
            name="type"
            componentclass="select"
            required={true}
            defaultValue={type}
            onChange={(e: any) => setType(e.target.value)}
          >
            <option value="">Select type</option>
            {TRANSACTION_TYPES.map(transctionType => (
              <option key={transctionType.value} value={transctionType.value}>
                {transctionType.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Account Number")}</ControlLabel>
          <FormControl
            value={fromAccount}
            placeholder={__("Account number")}
            onChange={(e: any) => setFromAccount(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Account Name")}</ControlLabel>
          <FormControl
            value={fromAccountName}
            placeholder={__("Account Name")}
            onChange={(e: any) => setFromAccountName(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Currency")}</ControlLabel>
          <FormControl
            required={true}
            value={fromCurrency}
            placeholder={__("Currency")}
            onChange={(e: any) => setFromCurrency(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}> to Bank</ControlLabel>
          <FormControl
            {...formProps}
            id="toBank"
            name="toBank"
            componentclass="select"
            required={true}
            defaultValue={toBank}
            onChange={(e: any) => setToBank(e.target.value)}
          >
            <option value=""> Select receive bank</option>
            {BANK_CODES.map(bank => (
              <option key={bank.value} value={bank.value}>
                {bank.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>
            {__("receive Account number")}
          </ControlLabel>
          <FormControl
            placeholder={__("receive Account number")}
            value={toAccount}
            onChange={(e: any) => setToAccount(e.target.value)}
            className="select"
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("account name")}</ControlLabel>
          <FormControl
            value={toAccountName}
            placeholder={__("receive Account Name")}
            onChange={(e: any) => setToAccountName(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("receive currency")}</ControlLabel>
          <FormControl
            required={true}
            value={toCurrency}
            placeholder={__("receive currency")}
            onChange={(e: any) => setToCurrency(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Amount")}</ControlLabel>
          <FormControl
            value={amount}
            type="number"
            placeholder={__("from amount")}
            onChange={(e: any) => setAmount(Number(e.target.value))}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Description")}</ControlLabel>
          <FormControl
            required={true}
            value={description}
            placeholder={__("Description")}
            onChange={(e: any) => setDescription(e.target.value)}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="success"
            icon="check-circle"
            type="submit"
            onClick={() => {
              props.submit({
                fromAccount,
                fromAccountName,
                toAccount,
                toAccountName,
                toBank,
                toCurrency,
                description,
                fromCurrency,
                amount,
                refCode,
                type
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
