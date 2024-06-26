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
import { config } from "process";

type Props = {
  configId: string;
  accounts?: IGolomtBankAccount[];
  accountNumber?: string;
  submit: (
    configId,
    fromAccount,
    toAccount,
    toAccountName,
    fromBank,
    toBank,
    toCurrency,
    toDescription,
    fromDescription,
    fromCurrency,
    toAmount,
    fromAmount,
    type
  ) => void;
  closeModal: () => void;
};

const TransactionForm = (props: Props) => {
  //const accounts = props.accounts || [];
  const { accountNumber } = props;
  console.log("accounts:", props.accountNumber);
  const [refCode, setRef] = useState("");
  const [fromAccount, setAccount] = useState(accountNumber || "");
  const [toAccount, setReceiveaccount] = useState("");
  const [toBank, setTobank] = useState("15");
  const [fromBank, setFrombank] = useState("15");
  const [fromDescription, setFromdescription] = useState("");
  const [toDescription, setTodescription] = useState("");
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [fromCurrency, setFromcurrency] = useState("");
  const [toCurrency, setTocurrency] = useState("");
  const [toAccountName, setToaccountname] = useState("");

  const [type, setType] = useState(0);
  const [transaction, setTransaction] = useState<IGolomtBankTransactionInput>({
    refCode: "",
    accountId: accountNumber || "",
    toAccountName: "",
    receiveAccount: "",
    bankCode: "",
    toBank: "",
    toCurrency: "MNT",
    description: "",
    currency: "MNT",
    amount: 0,
  });
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
            onChange={(e: any) => setRef(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Account Number")}</ControlLabel>
          <FormControl
            value={fromAccount}
            placeholder="Account number"
            onChange={(e: any) => setAccount(e.target.value)}
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
            onChange={(e: any) => setFromdescription(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("from currency")}</ControlLabel>
          <FormControl
            required={true}
            value={fromCurrency}
            placeholder="from currency"
            onChange={(e: any) => setFromcurrency(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__("to Account number")}</ControlLabel>
          <FormControl
            placeholder=" receive Account number"
            value={toAccount}
            onChange={(e: any) => setReceiveaccount(e.target.value)}
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
            onChange={(e: any) => setTobank(e.target.value)}
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
            onChange={(e: any) => setTodescription(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("account name")}</ControlLabel>
          <FormControl
            value={toAccountName}
            placeholder="to Account Name"
            onChange={(e: any) => setToaccountname(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("to currency")}</ControlLabel>
          <FormControl
            required={true}
            value={toCurrency}
            placeholder="to currency"
            onChange={(e: any) => setTocurrency(e.target.value)}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="success"
            icon="check-circle"
            type="submit"
            onClick={() => {
              props.submit(
                configId,
                fromAccount,
                toAccount,
                toAccountName,
                fromBank,
                toBank,
                toCurrency,
                toDescription,
                fromDescription,
                fromCurrency,
                toAmount,
                fromAmount,
                type
              );
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
