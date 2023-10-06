import React, { useState, useEffect, FC } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { Alert, __ } from '@erxes/ui/src/utils';
import { IPaymentsData, IDeal } from '../../types';

const GENERATE_INVOICE_URL = gql`
  mutation GenerateInvoiceUrl(
    $amount: Float!
    $contentType: String
    $contentTypeId: String
    $customerId: String
    $customerType: String
    $description: String
    $email: String
    $paymentIds: [String]
    $phone: String
  ) {
    generateInvoiceUrl(
      amount: $amount
      contentType: $contentType
      contentTypeId: $contentTypeId
      customerId: $customerId
      customerType: $customerType
      description: $description
      email: $email
      paymentIds: $paymentIds
      phone: $phone
    )
  }
`;

// App
// window.postMessage
// tslint:disable-next-line:interface-name
interface PaymentModalProps {
  payment: any;
  paymentsData: IPaymentsData;
  dealQuery: IDeal;
}
const PaymentModal: FC<PaymentModalProps> = ({
  payment,
  paymentsData,
  dealQuery
}) => {
  const [mutGenInvoiceLink] = useMutation(GENERATE_INVOICE_URL, {
    onError: console.error
  });

  const onClickPay = async () => {
    const convertedObject = payment.reduce((result, item) => {
      return item;
    }, {});

    if (
      paymentsData &&
      paymentsData.mobile &&
      paymentsData.mobile.amount !== undefined
    ) {
      const mobile_amount = paymentsData.mobile.amount;
      const deal_id = dealQuery._id;
      try {
        const invoiceRes = await mutGenInvoiceLink({
          variables: {
            amount: mobile_amount,
            contentType: 'cards:deal',
            contentTypeId: deal_id,
            paymentIds: convertedObject.paymentIds
          }
        });

        // Calculate the center position for the popup window
        const popupWidth = 1280;
        const popupHeight = 720;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const left = (screenWidth - popupWidth) / 2;
        const top = (screenHeight - popupHeight) / 2;

        // Open the popup window centered on the screen
        const popupWindow = window.open(
          invoiceRes.data.generateInvoiceUrl,
          'popup',
          `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
        );

        if (popupWindow) {
          // Focus the popup window (optional)
          popupWindow.focus();
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      return Alert.error('Please enter mobile amount');
    }
  };

  useEffect(() => {
    const onMessage = async event => {
      const { fromPayment, message, invoiceId, contentTypeId } = event.data;

      if (message === 'paymentSuccessfull') {
        try {
          // const deal_query = await useQuery(PAYMENT_SUCCESS);
          window.location.reload();
          // Process the result of the query here if needed
        } catch (error) {
          console.error(error);
        }
      }
    };
    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <Button  onClick={onClickPay}>
    {__('Pay')}
    </Button>
  );
};

export default PaymentModal;
