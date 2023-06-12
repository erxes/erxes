import { gql } from '@apollo/client';

import { paymentConfigFields } from './common';

const payments = gql`
  query payments($status: String) {
    payments(status: $status) {
      _id
      name
      kind
      status
      config
    }
  }
`;

const paymentsTotalCountQuery = gql`
  query paymentsTotalCount($kind: String, $status: String) {
    paymentsTotalCount(kind: $kind, status: $status) {
      byKind
      total
    }
  }
`;

const invoicesFields = `
    _id
    amount
    contentType
    contentTypeId
    createdAt
    customerType
    customerId
    description
    email
    payment {
      name
      kind
    }
    phone
    resolvedAt
    status
    customer
`;

const invoices = gql`
query invoices($page: Int, $perPage: Int, $kind: String, $searchValue: String, $status: String, $contentType: String, $contentTypeId: String) {
  invoices(page: $page, perPage: $perPage, kind: $kind, searchValue: $searchValue, status: $status, contentType: $contentType, contentTypeId: $contentTypeId) {
    ${invoicesFields}
  }
}
`;

const invoicesTotalCount = gql`
  query invoicesTotalCount(
    $kind: String
    $searchValue: String
    $status: String
  ) {
    invoicesTotalCount(
      kind: $kind
      searchValue: $searchValue
      status: $status
    ) {
      byKind
      byStatus
      total
    }
  }
`;

const getInvoice = gql`
  query InvoiceDetail($_id: String!) {
    invoiceDetail(_id: $_id) {
      _id
      amount
      apiResponse
      contentType
      contentTypeId
      createdAt
      customer
      customerId
      customerType
      description
      email
      payment {
        _id
        createdAt
        kind
        name
      }
      paymentId
      paymentKind
      phone
      resolvedAt
      status
      idOfProvider
      errorDescription
    }
  }
`;

const paymentConfigQuery = gql`
  query GetPaymentConfig($contentType: String!, $contentTypeId: String!) {
    getPaymentConfig(contentType: $contentType, contentTypeId: $contentTypeId) {
      ${paymentConfigFields}
    }
  }
`;

const paymentConfigsQuery = gql`
  query GetPaymentConfigs($contentType: String, $page: Int, $perPage: Int) {
    getPaymentConfigs(
      contentType: $contentType
      page: $page
      perPage: $perPage
    ) {
      ${paymentConfigFields}

      payments {
        _id
        name
        kind
      }
    }
  }
`;

const paymentConfigsTotalCount = gql`
  query paymentConfigsTotalCount {
    paymentConfigsTotalCount
  }
`;

export default {
  payments,
  paymentsTotalCountQuery,
  paymentConfigQuery,
  invoices,
  getInvoice,
  invoicesTotalCount,

  paymentConfigsQuery,
  paymentConfigsTotalCount
};
