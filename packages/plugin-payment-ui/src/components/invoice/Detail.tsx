import Box from '@erxes/ui/src/components/Box';
import Info from '@erxes/ui/src/components/Info';
import Label from '@erxes/ui/src/components/Label';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { DateWrapper, Flex } from '@erxes/ui/src/styles/main';
import Alert from '@erxes/ui/src/utils/Alert';
import {
  loadDynamicComponent,
  renderFullName,
  renderUserFullName
} from '@erxes/ui/src/utils/core';

import dayjs from 'dayjs';
import React from 'react';

import { IInvoice } from '../../types';
import { PAYMENTCONFIGS } from '../constants';

type Props = {
  invoice: IInvoice;
};

const Detail = ({ invoice }: Props) => {
  const renderStatus = () => {
    let labelStyle = 'danger';

    switch (invoice.status) {
      case 'paid':
        labelStyle = 'success';
        break;
      case 'pending':
        labelStyle = 'warning';
        break;
      default:
        labelStyle = 'danger';
        break;
    }

    return (
      <li>
        <FieldStyle overflow="unset">Status:</FieldStyle>
        <Label lblStyle={labelStyle}>{invoice.status}</Label>
      </li>
    );
  };

  const renderKind = () => {
    const payment = PAYMENTCONFIGS.find(item => {
      if (item.kind === invoice.paymentKind) {
        return item;
      }
    });

    return (
      <li>
        <FieldStyle overflow="unset">Kind:</FieldStyle>
        <SidebarCounter nowrap={true}>
          <Label lblColor={payment?.color || 'blue'}>{payment?.name}</Label>
        </SidebarCounter>
      </li>
    );
  };

  const renderError = () => {
    if (!invoice.errorDescription) {
      return null;
    }

    return (
      <Info>
        <p>
          <strong>Error:</strong> {invoice.errorDescription}
        </p>
      </Info>
    );
  };

  const renderCustomer = () => {
    if (!invoice.customer) {
      return null;
    }

    let link = `/contacts/details/${invoice.customerId}`;
    let name = renderFullName(invoice.customer);

    if (invoice.customerType === 'user') {
      link = `/settings/team/details/${invoice.customerId}`;
      name = renderUserFullName(invoice.customer);
    }

    if (invoice.customerType === 'company') {
      link = `/companies/details/${invoice.customerId}`;
      name = invoice.customer.primaryName || invoice.customer.website;
    }

    return (
      <li
        onClick={() => {
          window.open(link, '_blank');
        }}
      >
        <FieldStyle overflow="unset">Customer:</FieldStyle>

        <SidebarCounter nowrap={true}>
          <span>{name}</span>
        </SidebarCounter>
      </li>
    );
  };

  const renderRightSection = () => {
    if (!invoice.contentType) {
      return null;
    }

    if (invoice.contentType.split(':').length < 2) {
      return null;
    }

    const title = 'Related ' + invoice.contentType.split(':')[1];

    return (
      <Box isOpen={true} collapsible={false} title={title}>
        {loadDynamicComponent('invoiceDetailRightSection', { invoice })}
      </Box>
    );
  };

  return (
    <>
      <Flex>
        <div style={{ width: '50%' }}>
          <SidebarList className="no-link">
            <li
              onClick={() => {
                navigator.clipboard.writeText(invoice.idOfProvider);

                Alert.success('Invoice number copied to clipboard');
              }}
            >
              <FieldStyle overflow="unset">Invoice Number:</FieldStyle>
              <SidebarCounter nowrap={true}>
                {invoice.idOfProvider}
              </SidebarCounter>
            </li>
            <li>
              <FieldStyle overflow="unset">Date:</FieldStyle>

              <DateWrapper>
                {dayjs(invoice.createdAt || new Date()).format('ll')}
              </DateWrapper>
            </li>

            <li>
              <FieldStyle overflow="unset">Resolved Date:</FieldStyle>

              {invoice.resolvedAt ? (
                <DateWrapper>
                  {dayjs(invoice.resolvedAt || '-').format('ll')}
                </DateWrapper>
              ) : (
                '-'
              )}
            </li>

            {renderStatus()}
            {renderKind()}
            {renderCustomer()}
            <li>
              <FieldStyle overflow="unset">Amount:</FieldStyle>
              <SidebarCounter nowrap={true}>
                {invoice.amount.toLocaleString()}
              </SidebarCounter>
            </li>
            <li
              onClick={() => {
                navigator.clipboard.writeText(invoice.description);

                Alert.success('Invoice description copied to clipboard');
              }}
            >
              <FieldStyle overflow="unset">Description:</FieldStyle>
              <SidebarCounter nowrap={true}>
                {invoice.description}
              </SidebarCounter>
            </li>
          </SidebarList>
          &nbsp;
          {renderError()}
        </div>
        <div style={{ width: '50%' }}>{renderRightSection()}</div>
      </Flex>
    </>
  );
};

export default Detail;
