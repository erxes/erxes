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
  submit: (
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
    fromAmount
  ) => void;
  closeModal: () => void;
};

const TransactionForm = (props: Props) => {
  const { accountNumber } = props;
  const [refCode, setref] = useState("");
  const [fromAccount, setaccount] = useState(accountNumber || "");
  const [toAccount, setreceiveaccount] = useState("");
  const [toBank, settobank] = useState("15");
  const [fromDescription, setfromdescription] = useState("");
  const [toDescription, settodescription] = useState("");
  const [fromAmount, setfromAmount] = useState(0);
  const [toAmount, settoAmount] = useState(0);
  const [fromCurrency, setfromcurrency] = useState("");
  const [toCurrency, settocurrency] = useState("");
  const [toAccountName, settoaccountname] = useState("");

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
            onChange={(e: any) => setref(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Account Number")}</ControlLabel>
          <FormControl
            value={fromAccount}
            placeholder="Account number"
            onChange={(e: any) => setaccount(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__(" from amount")}</ControlLabel>
          <FormControl
            value={fromAmount}
            type="number"
            placeholder="from amount"
            onChange={(e: any) => setfromAmount(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Description")}</ControlLabel>
          <FormControl
            required={true}
            value={fromDescription}
            placeholder="from description"
            onChange={(e: any) => setfromdescription(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("from currency")}</ControlLabel>
          <FormControl
            required={true}
            value={fromCurrency}
            placeholder="from currency"
            onChange={(e: any) => setfromcurrency(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__("to Account number")}</ControlLabel>
          <FormControl
            placeholder=" receive Account number"
            value={toAccount}
            onChange={(e: any) => setreceiveaccount(e.target.value)}
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
            onChange={(e: any) => settoAmount(e.target.value)}
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
            onChange={(e: any) => settobank(e.target.value)}
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
            onChange={(e: any) => settodescription(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("account name")}</ControlLabel>
          <FormControl
            value={toAccountName}
            placeholder="to Account Name"
            onChange={(e: any) => settoaccountname(e.target.value)}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("to currency")}</ControlLabel>
          <FormControl
            required={true}
            value={toCurrency}
            placeholder="to currency"
            onChange={(e: any) => settocurrency(e.target.value)}
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
                toBank,
                toCurrency,
                toDescription,
                fromDescription,
                fromCurrency,
                toAmount,
                fromAmount
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
