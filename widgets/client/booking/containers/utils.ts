import gql from 'graphql-tag';
import client from '../../apollo-client';
import { getLocalStorageItem, setLocalStorageItem } from '../../common';
import { requestBrowserInfo } from '../../utils';
import { connection } from '../connection';
import { saveBookingMutation } from '../graphql';

export const saveBrowserInfo = () => {
  requestBrowserInfo({
    source: 'fromBookings',
    postData: {
      setting: connection.setting
    },
    callback: browserInfo => {
      connection.browserInfo = browserInfo;
    }
  });
};

/*
 * Save user submissions
 */
export const saveBooking = (params: {
  doc: any;
  browserInfo: any;
  integrationId: string;
  formId: string;
  productId: string;
  saveCallback: (response: any) => void;
}) => {
  const {
    doc,
    browserInfo,
    integrationId,
    formId,
    saveCallback,
    productId
  } = params;

  const submissions = Object.keys(doc).map(fieldId => {
    const {
      value,
      text,
      type,
      validation,
      associatedFieldId,
      groupId,
      isHidden,
      column
    } = doc[fieldId];

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
      column
    };
  });

  const variables = {
    integrationId,
    formId,
    browserInfo,
    submissions: submissions.filter(e => e),
    cachedCustomerId: getLocalStorageItem('customerId'),
    productId
  };

  client
    .mutate({
      mutation: gql(saveBookingMutation),
      variables
    })

    .then(({ data }) => {
      if (data) {
        const { widgetsSaveBooking } = data;
        saveCallback(widgetsSaveBooking);

        if (widgetsSaveBooking.customerId) {
          setLocalStorageItem(
            'customerId',
            widgetsSaveBooking.customerId,
            connection.setting
          );
        }
      }
    })

    .catch(e => {
      console.log(e);
      saveCallback({ status: 'error', errors: [{ text: e.message }] });
    });
};
