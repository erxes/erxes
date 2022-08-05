import * as path from 'path';

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
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IInvoice, IInvoiceDoc } from '../types';

import { DateContainer } from '@erxes/ui/src/styles/main';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import React from 'react';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries } from '../graphql';
import { setTimeout } from 'timers';

const SelectCompanies = asyncComponent(
  () =>
    isEnabled('contacts') &&
    path.resolve(
      /* webpackChunkName: "SelectCompanies" */ '@erxes/ui-contacts/src/companies/containers/SelectCompanies'
    )
);

const SelectCustomers = asyncComponent(
  () =>
    isEnabled('contacts') &&
    path.resolve(
      /* webpackChunkName: "SelectCustomers" */ '@erxes/ui-contacts/src/customers/containers/SelectCustomers'
    )
);

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  invoice: IInvoice;
  closeModal: () => void;
  companies: ICompany[];
  customers: ICustomer[];
};

type State = {
  companyId: string;
  customerId: string;

  number: string;
  payDate: Date;
  payment: number;
  interestEve: number;
  interestNonce: number;
  undue: number;
  insurance: number;
  debt: number;
  total: number;
};

class InvoiceForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { invoice = {}, companies, customers } = props;

    this.state = {
      number: invoice.number || '',
      payDate: invoice.payDate || '',
      payment: invoice.payment || 0,
      interestEve: invoice.interestEve || 0,
      interestNonce: invoice.interestNonce || 0,
      undue: invoice.undue || 0,
      insurance: invoice.insurance || 0,
      debt: invoice.debt || 0,
      total: invoice.total || 0,
      companyId:
        invoice.companyId ||
        (companies && companies.length ? companies[0]._id : ''),
      customerId:
        invoice.customerId ||
        (customers && customers.length ? customers[0]._id : '')
    };
  }

  generateDoc = (values: { _id: string } & IInvoiceDoc) => {
    const { invoice } = this.props;

    const finalValues = values;

    if (invoice && invoice._id) {
      finalValues._id = invoice._id;
    }

    return {
      _id: finalValues._id,
      contractId: invoice.contractId,
      ...this.state,
      number: this.state.number,
      payDate: finalValues.payDate,
      payment: Number(this.state.payment),
      interestEve: Number(this.state.interestEve),
      interestNonce: Number(this.state.interestNonce),
      undue: Number(this.state.undue),
      insurance: Number(this.state.insurance),
      debt: Number(this.state.debt),
      total: Number(this.state.total)
    };
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const invoice = this.props.invoice || ({} as IInvoice);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onSelect = (value, name) => {
      this.setState({ [name]: value } as any);
    };

    const onChangeField = e => {
      this.setState({
        [(e.target as HTMLInputElement).name]: (e.target as HTMLInputElement)
          .value
      } as any);

      setTimeout(() => {
        const {
          payment,
          interestEve,
          interestNonce,
          undue,
          insurance
        } = this.state;
        const total =
          Number(payment) +
          Number(interestEve) +
          Number(interestNonce) +
          Number(undue) +
          Number(insurance);
        this.setState({ total });
      }, 100);
    };

    const onChangePayDate = value => {
      client
        .query({
          query: gql(queries.getInvoicePreInfo),
          fetchPolicy: 'network-only',
          variables: { contractId: invoice.contractId, payDate: value }
        })
        .then(({ data }) => {
          const invoiceInfo = data.getInvoicePreInfo;
          this.setState({
            number: invoiceInfo.number,
            payment: invoiceInfo.payment,
            interestEve: invoiceInfo.interestEve,
            interestNonce: invoiceInfo.interestNonce,
            undue: invoiceInfo.undue,
            insurance: invoiceInfo.insurance,
            debt: invoiceInfo.debt,
            total: invoiceInfo.total
          });
        });
      this.setState({ payDate: value });
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {this.renderFormGroup('Number', {
                ...formProps,
                name: 'number',
                onChange: onChangeField,
                value: this.state.number || ''
              })}

              <FormGroup>
                <ControlLabel>Pay Date</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="payDate"
                    value={this.state.payDate}
                    onChange={onChangePayDate}
                  />
                </DateContainer>
              </FormGroup>

              {isEnabled('contacts') && (
                <>
                  <FormGroup>
                    <ControlLabel>Company</ControlLabel>
                    <SelectCompanies
                      label="Choose an company"
                      name="companyId"
                      initialValue={this.state.companyId}
                      onSelect={onSelect}
                      multi={false}
                    />
                  </FormGroup>

                  <FormGroup>
                    <ControlLabel>Customer</ControlLabel>
                    <SelectCustomers
                      label="Choose an customer"
                      name="customerId"
                      initialValue={this.state.customerId}
                      onSelect={onSelect}
                      multi={false}
                    />
                  </FormGroup>
                </>
              )}
            </FormColumn>
            <FormColumn>
              {this.renderFormGroup('payment', {
                ...formProps,
                name: 'payment',
                type: 'number',
                onChange: onChangeField,
                value: this.state.payment || 0
              })}

              {this.renderFormGroup('interest eve', {
                ...formProps,
                name: 'interestEve',
                type: 'number',
                onChange: onChangeField,
                value: this.state.interestEve || 0
              })}

              {this.renderFormGroup('interest nonce', {
                ...formProps,
                name: 'interestNonce',
                type: 'number',
                onChange: onChangeField,
                value: this.state.interestNonce || 0
              })}

              {this.renderFormGroup('undue', {
                ...formProps,
                name: 'undue',
                type: 'number',
                onChange: onChangeField,
                value: this.state.undue || 0
              })}

              {this.renderFormGroup('insurance', {
                ...formProps,
                name: 'insurance',
                type: 'number',
                onChange: onChangeField,
                value: this.state.insurance || 0
              })}

              {this.renderFormGroup('debt', {
                ...formProps,
                name: 'debt',
                type: 'number',
                onChange: onChangeField,
                value: this.state.debt || 0
              })}

              {this.renderFormGroup('total', {
                ...formProps,
                name: 'total',
                type: 'number',
                value: this.state.total || 0,
                required: true
              })}
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'invoice',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.invoice
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default InvoiceForm;
