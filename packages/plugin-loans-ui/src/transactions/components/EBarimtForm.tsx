import {
  Button,
  ButtonMutate,
  ControlLabel,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from "@erxes/ui/src";
import { ITransaction, ITransactionDoc } from "../types";
import React, { useState } from "react";
import { mutations, queries } from "../graphql";

import { Amount } from "../../contracts/styles";
import { IFormProps } from "@erxes/ui/src/types";
import { IInvoice } from "../../invoices/types";
import { __ } from "coreui/utils";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";

type Props = {
  transaction: ITransaction;
  invoice?: IInvoice;
  closeModal: () => void;
  isGotEBarimt: boolean;
};

type State = {
  contractId: string;
  companyId: string;
  customerId: string;
  invoiceId: string;
  invoice?: IInvoice;
  payDate: Date;
  description: string;
  total: number;
  paymentInfo: any;
  isGetEBarimt?: boolean;
  isOrganization?: boolean;
  organizationRegister?: string;
  organizationName?: string;
};

const EBarimtForm = (props: Props) => {
  const { transaction = {} as ITransaction } = props;

  const [contractId, setContractId] = useState(
    transaction.contractId || (props.invoice && props.invoice.contractId) || ""
  );
  const [payDate, setPayDate] = useState(
    transaction.payDate ||
      (props.invoice && props.invoice.payDate) ||
      new Date()
  );
  const [invoiceId, setInvoiceId] = useState(
    transaction.invoiceId || (props.invoice && props.invoice._id) || ""
  );
  const [description, setDescription] = useState(transaction.description || "");
  const [total, setTotal] = useState(
    transaction.total || (props.invoice && props.invoice.total) || 0
  );
  const [companyId, setCompanyId] = useState(
    transaction.companyId || (props.invoice && props.invoice.companyId) || ""
  );
  const [customerId, setCustomerId] = useState(
    transaction.customerId || (props.invoice && props.invoice.customerId) || ""
  );
  const [invoice, setInvoice] = useState(
    props.invoice || transaction.invoice || null
  );
  const [paymentInfo, setPaymentInfo] = useState(null as any);
  const [isGetEBarimt, setIsGetEBarimt] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [organizationRegister, setOrganizationRegister] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const generateDoc = (values: { _id: string } & ITransactionDoc) => {
    const finalValues = values;

    if (transaction && transaction._id) {
      finalValues._id = transaction._id;
    }

    return {
      id: finalValues._id,
      companyId,
      contractId,
      invoiceId,
      description,
      invoice,
      paymentInfo,
      customerId,
      isGetEBarimt,
      organizationRegister,
      organizationName,
      isOrganization,
      isManual: true,
      payDate: finalValues.payDate,
      total: Number(total),
    };
  };

  const onFieldClick = (e) => {
    e.target.select();
  };

  const renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const renderRow = (label, fieldName) => {
    const invoiceVal = (invoice && invoice[fieldName]) || 0;
    const trVal =
      (fieldName === "total" && total) || transaction[fieldName] || 0;

    return (
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{`${label}`}</ControlLabel>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(invoiceVal).toLocaleString()}</Amount>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(trVal).toLocaleString()}</Amount>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(trVal - invoiceVal).toLocaleString()}</Amount>
        </FormColumn>
      </FormWrapper>
    );
  };

  const renderRowTr = (label, fieldName, isFromState?: any) => {
    let trVal = "";

    if (isFromState) {
      trVal = total.toString();
    } else trVal = paymentInfo?.[fieldName] || transaction[fieldName] || 0;

    return (
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{`${__(label)}:`}</ControlLabel>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(trVal).toLocaleString()}</Amount>
        </FormColumn>
      </FormWrapper>
    );
  };

  const renderInfo = () => {
    if (!invoice) {
      return (
        <>
          <FormWrapper>
            <FormColumn>
              <ControlLabel>{__("Type")}</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel>Transaction</ControlLabel>
            </FormColumn>
          </FormWrapper>
          {renderRowTr("Total must pay", "total")}
          {renderRowTr("Payment", "payment")}
          {renderRowTr("Interest Eve", "interestEve")}
          {renderRowTr("Interest Nonce", "interestNonce")}
          {renderRowTr("Loss", "loss")}
          {renderRowTr("Insurance", "insurance")}
          {renderRowTr("Debt", "debt")}
        </>
      );
    }

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>Type</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>Invoice</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>Transaction</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>Change</ControlLabel>
          </FormColumn>
        </FormWrapper>
        {renderRow("total", "total")}
        {renderRow("payment", "payment")}
        {renderRow("interest eve", "interestEve")}
        {renderRow("interest nonce", "interestNonce")}
        {renderRow("loss", "loss")}
        {renderRow("insurance", "insurance")}
        {renderRow("debt", "debt")}
      </>
    );
  };

  const renderButton = ({ name, values, isSubmitted, object }: any) => {
    const { closeModal } = props;

    const afterSave = (data) => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={mutations.createEBarimtOnTransaction}
        variables={values}
        callback={afterSave}
        refetchQueries={["transactionsMain"]}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      >
        {__("Get")}
      </ButtonMutate>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal } = props;
    const { values, isSubmitted } = formProps;

    const getCompanyName = (register) => {
      if (register && register.length === 7)
        client
          .query({
            query: gql(queries.getCompanyName),
            variables: { companyRd: register },
          })
          .then(({ data }) => {
            data?.ebarimtGetCompany?.info;
            setOrganizationName(data?.ebarimtGetCompany?.info?.name);
          });
    };

    const onChangeField = (e) => {
      if ((e.target as HTMLInputElement).name === "total") {
        const value = Number((e.target as HTMLInputElement).value);

        if (value > paymentInfo.closeAmount) {
          (e.target as HTMLInputElement).value = paymentInfo.closeAmount;
        }
      }
      if (
        (e.target as HTMLInputElement).name === "organizationRegister" &&
        isOrganization &&
        isGetEBarimt
      ) {
        if ((e.target as HTMLInputElement).value.length > 7) return;
        if ((e.target as HTMLInputElement).value.length < 7) {
          setOrganizationName("");
        }
        getCompanyName((e.target as HTMLInputElement).value);
      }
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLInputElement).value;
      const name = (e.target as HTMLInputElement).name;
      if (name === "isGetEBarimt") {
        setIsGetEBarimt(value as any);
      }
      if (name === "isOrganization") {
        setIsOrganization(value as any);
      }
      if (name === "organizationRegister") {
        setOrganizationRegister(value as any);
      }
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {renderRowTr("Total", "total", true)}
              {!props.isGotEBarimt && (
                <FormGroup>
                  <ControlLabel>{__("Is get E-Barimt")}</ControlLabel>
                  <FormControl
                    {...formProps}
                    type={"checkbox"}
                    componentclass="checkbox"
                    useNumberFormat
                    fixed={0}
                    name="isGetEBarimt"
                    value={isGetEBarimt}
                    onChange={onChangeField}
                    onClick={onFieldClick}
                  />
                </FormGroup>
              )}
              {isGetEBarimt && (
                <FormGroup>
                  <ControlLabel>{__("Is organization")}</ControlLabel>
                  <FormControl
                    {...formProps}
                    type={"checkbox"}
                    componentclass="checkbox"
                    useNumberFormat
                    fixed={0}
                    name="isOrganization"
                    value={isOrganization}
                    onChange={onChangeField}
                    onClick={onFieldClick}
                  />
                </FormGroup>
              )}
              {isGetEBarimt && isOrganization && (
                <FormWrapper>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>{__("Organization Register")}</ControlLabel>
                      <FormControl
                        {...formProps}
                        type={"number"}
                        fixed={2}
                        name="organizationRegister"
                        value={organizationRegister}
                        onChange={onChangeField}
                        onClick={onFieldClick}
                      />
                    </FormGroup>
                  </FormColumn>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>{__("Organization Name")}</ControlLabel>
                      <FormControl
                        {...formProps}
                        disabled
                        maxLength={7}
                        value={organizationName}
                      />
                    </FormGroup>
                  </FormColumn>
                </FormWrapper>
              )}
            </FormColumn>
          </FormWrapper>

          {renderInfo()}
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__("Close")}
          </Button>

          {!props.isGotEBarimt &&
            renderButton({
              name: "transaction",
              values: generateDoc(values),
              isSubmitted,
              object: transaction,
            })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default EBarimtForm;
