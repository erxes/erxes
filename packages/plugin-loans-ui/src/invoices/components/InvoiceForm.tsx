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
  MainStyleScrollWrapper as ScrollWrapper
} from "@erxes/ui/src";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { IInvoice, IInvoiceDoc } from "../types";
import React, { useState } from "react";

import { DateContainer } from "@erxes/ui/src/styles/main";
import { ICompany } from "@erxes/ui-contacts/src/companies/types";
import { ICustomer } from "@erxes/ui-contacts/src/customers/types";
import { __ } from "coreui/utils";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { queries } from "../graphql";

const SelectCompanies = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCompanies" */ "@erxes/ui-contacts/src/companies/containers/SelectCompanies"
    )
);

const SelectCustomers = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCustomers" */ "@erxes/ui-contacts/src/customers/containers/SelectCustomers"
    )
);

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  invoice: IInvoice;
  closeModal: () => void;
  companies: ICompany[];
  customers: ICustomer[];
};

const InvoiceForm = (props: Props) => {
  const { invoice = {} as IInvoice, companies, customers } = props;

  const [number, setNumber] = useState(invoice.number || "");
  const [payDate, setPayDate] = useState(invoice.payDate || "");
  const [payment, setPayment] = useState(invoice.payment || 0);
  const [interestEve, setInterestEve] = useState(invoice.interestEve || 0);
  const [interestNonce, setInterestNonce] = useState(
    invoice.interestNonce || 0
  );
  const [loss, setLoss] = useState(invoice.loss || 0);
  const [insurance, setInsurance] = useState(invoice.insurance || 0);
  const [debt, setDebt] = useState(invoice.debt || 0);
  const [total, setTotal] = useState(invoice.total || 0);
  const [companyId, setCompanyId] = useState(
    invoice.companyId || (companies && companies.length ? companies[0]._id : "")
  );
  const [customerId, setCustomerId] = useState(
    invoice.customerId ||
      (customers && customers.length ? customers[0]._id : "")
  );

  const generateDoc = (values: { _id: string } & IInvoiceDoc) => {
    const finalValues = values;

    if (invoice && invoice._id) {
      finalValues._id = invoice._id;
    }

    return {
      _id: finalValues._id,
      contractId: invoice.contractId,
      companyId,
      customerId,
      number: number,
      payDate: finalValues.payDate,
      payment: Number(payment),
      interestEve: Number(interestEve),
      interestNonce: Number(interestNonce),
      loss: Number(loss),
      insurance: Number(insurance),
      debt: Number(debt),
      total: Number(total)
    };
  };

  const renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onSelect = (value, name) => {
      if (name === "companyId") {
        setCompanyId(value);
      }
      if (name === "customerId") {
        setCustomerId(value);
      }
    };

    const onChangeField = e => {
      const name = (e.target as HTMLInputElement).name;
      const value = (e.target as HTMLInputElement).value;
      if (name === "number") {
        setNumber(value as any);
      }
      if (name === "payment") {
        setPayment(value as any);
      }
      if (name === "interestEve") {
        setInterestEve(value as any);
      }
      if (name === "interestNonce") {
        setInterestNonce(value as any);
      }
      if (name === "loss") {
        setLoss(value as any);
      }
      if (name === "insurance") {
        setInsurance(value as any);
      }
      if (name === "debt") {
        setDebt(value as any);
      }

      setTimeout(() => {
        const total =
          Number(payment) +
          Number(interestEve) +
          Number(interestNonce) +
          Number(loss) +
          Number(insurance);
        setTotal(total);
      }, 100);
    };

    const onChangePayDate = value => {
      client
        .query({
          query: gql(queries.getInvoicePreInfo),
          fetchPolicy: "network-only",
          variables: { contractId: invoice.contractId, payDate: value }
        })
        .then(({ data }) => {
          const invoiceInfo = data.getInvoicePreInfo;
          setNumber(invoiceInfo.number);
          setPayment(invoiceInfo.payment);
          setInterestEve(invoiceInfo.interestEve);
          setInterestNonce(invoiceInfo.interestNonce);
          setLoss(invoiceInfo.loss);
          setInsurance(invoiceInfo.insurance);
          setDebt(invoiceInfo.debt);
          setTotal(invoiceInfo.total);
        });
      setPayDate(value);
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {renderFormGroup("Number", {
                ...formProps,
                name: "number",
                onChange: onChangeField,
                value: number || ""
              })}

              <FormGroup>
                <ControlLabel>Pay Date</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    dateFormat="YYYY/MM/DD"
                    name="payDate"
                    value={payDate}
                    onChange={onChangePayDate}
                  />
                </DateContainer>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Company</ControlLabel>
                <SelectCompanies
                  label="Choose an company"
                  name="companyId"
                  initialValue={companyId}
                  onSelect={onSelect}
                  multi={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Customer</ControlLabel>
                <SelectCustomers
                  label="Choose an customer"
                  name="customerId"
                  initialValue={customerId}
                  onSelect={onSelect}
                  multi={false}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              {renderFormGroup("payment", {
                ...formProps,
                name: "payment",
                type: "number",
                onChange: onChangeField,
                value: payment || 0
              })}

              {renderFormGroup("interest eve", {
                ...formProps,
                name: "interestEve",
                type: "number",
                onChange: onChangeField,
                value: interestEve || 0
              })}

              {renderFormGroup("interest nonce", {
                ...formProps,
                name: "interestNonce",
                type: "number",
                onChange: onChangeField,
                value: interestNonce || 0
              })}

              {renderFormGroup("loss", {
                ...formProps,
                name: "loss",
                type: "number",
                onChange: onChangeField,
                value: loss || 0
              })}

              {renderFormGroup("insurance", {
                ...formProps,
                name: "insurance",
                type: "number",
                onChange: onChangeField,
                value: insurance || 0
              })}

              {renderFormGroup("debt", {
                ...formProps,
                name: "debt",
                type: "number",
                onChange: onChangeField,
                value: debt || 0
              })}

              {renderFormGroup("total", {
                ...formProps,
                name: "total",
                type: "number",
                value: total || 0,
                required: true
              })}
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__("Close")}
          </Button>

          {renderButton({
            name: "invoice",
            values: generateDoc(values),
            isSubmitted,
            object: props.invoice
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default InvoiceForm;
