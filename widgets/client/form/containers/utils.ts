import gql from 'graphql-tag';

import client from '../../apollo-client';
import { getLocalStorageItem } from '../../common';
import { IBrowserInfo, IEmailParams } from '../../types';
import { requestBrowserInfo } from '../../utils';
import { connection } from '../connection';
import {
  generateInvoiceUrl,
  getPaymentMethods,
  increaseViewCountMutation,
  saveFormMutation,
  sendEmailMutation,
} from '../graphql';
import { IFormDoc, ISaveFormResponse } from '../types';

/*
 * Send message to iframe's parent
 */
export const postMessage = (options: any) => {
  // notify parent window launcher state
  window.parent.postMessage(
    {
      fromErxes: true,
      source: 'fromForms',
      setting: connection.setting,
      ...options,
    },
    '*'
  );
};

export const saveBrowserInfo = () => {
  requestBrowserInfo({
    source: 'fromForms',
    postData: {
      setting: connection.setting,
    },
    callback: (browserInfo) => {
      connection.browserInfo = browserInfo;
    },
  });
};

/*
 * Send email to submitted user after successfull submission
 */
export const sendEmail = ({
  toEmails,
  fromEmail,
  title,
  content,
  formId,
  attachments,
}: IEmailParams) => {
  const customerId = connection.customerId
    ? connection.customerId
    : getLocalStorageItem('customerId');

  client.mutate({
    mutation: gql(sendEmailMutation),
    variables: {
      toEmails,
      fromEmail,
      title,
      content,
      customerId,
      formId,
      attachments,
    },
  });
};

/*
 * Increasing view count
 */
export const increaseViewCount = (formId: string) => {
  return client.mutate({
    mutation: gql(increaseViewCountMutation),
    variables: {
      formId,
    },
  });
};

/*
 * Save user submissions
 */
export const saveLead = (params: {
  doc: IFormDoc;
  browserInfo: IBrowserInfo;
  integrationId: string;
  formId: string;
  userId?: string;
  saveCallback: (response: ISaveFormResponse) => void;
}) => {
  const {
    doc,
    browserInfo,
    integrationId,
    formId,
    saveCallback,
    userId,
  } = params;

  const submissions = Object.keys(doc).map((fieldId) => {
    const {
      value,
      text,
      type,
      validation,
      associatedFieldId,
      groupId,
      isHidden,
      column,
      productId,
    } = doc[fieldId] || {};

    if (isHidden) {
      return;
    }

    return {
      _id: fieldId,
      type,
      text,
      value,
      validation,
      associatedFieldId,
      groupId,
      column,
      productId,
    };
  });

  const cachedCustomerId = connection.customerId
    ? connection.customerId
    : getLocalStorageItem('customerId');

  const variables = {
    integrationId,
    formId,
    browserInfo,
    submissions: submissions.filter((e) => e),
    cachedCustomerId,
    userId,
  };

  client
    .mutate({
      mutation: gql(saveFormMutation),
      variables,
    })

    .then(async ({ data }) => {
      if (data) {
        const { widgetsSaveLead } = data;

        if (widgetsSaveLead.customerId) {
          connection.customerId = widgetsSaveLead.customerId;

          postMessage({
            fromErxes: true,
            message: 'setLocalStorageItem',
            key: 'customerId',
            value: widgetsSaveLead.customerId,
          });
        }

        saveCallback(widgetsSaveLead);

        if (widgetsSaveLead && widgetsSaveLead.status === 'ok') {
          postMessage({
            message: 'formSuccess',
            variables,
          });
        }
      }
    })

    .catch((e) => {
      saveCallback({
        status: 'error',
        conversationId: '',
        errors: [{ text: e.message }],
      });
    });
};

export const generatePaymentLink = async (
  amount: number,
  conversationId: string
) => {
  try {
    const qryResponse: any = await client.query({
      query: gql(getPaymentMethods),
      variables: {
        contentType: 'inbox:integrations',
        contentTypeId: connection.data.integration._id,
      },
    });

    const { getPaymentConfig } = qryResponse.data;

    if (!getPaymentConfig || getPaymentConfig.paymentIds.length === 0) {
      return undefined;
    }

    const customerId = getLocalStorageItem('customerId');

    const mutationResponse: any = await client.mutate({
      mutation: gql(generateInvoiceUrl),
      variables: {
        customerId,
        amount,
        contentType: 'inbox:conversations',
        contentTypeId: conversationId,
        paymentIds: getPaymentConfig.paymentIds,
      },
    });

    const invoiceLink = mutationResponse.data.generateInvoiceUrl;

    if (invoiceLink) {
      return invoiceLink;
    }

    return undefined;
  } catch (e) {
    return undefined;
  }
  return undefined;
};
