import gql from "graphql-tag";
import client from "../../apollo-client";
import { getLocalStorageItem, setLocalStorageItem } from "../../common";
import { IBrowserInfo, IEmailParams } from "../../types";
import { requestBrowserInfo } from "../../utils";
import { connection } from "../connection";
import {
  increaseViewCountMutation,
  saveFormMutation,
  sendEmailMutation
} from "../graphql";
import { IFormDoc, ISaveFormResponse } from "../types";

/*
 * Send message to iframe's parent
 */
export const postMessage = (options: any) => {
  // notify parent window launcher state
  window.parent.postMessage(
    {
      fromErxes: true,
      source: "fromForms",
      setting: connection.setting,
      ...options
    },
    "*"
  );
};

export const saveBrowserInfo = () => {
  requestBrowserInfo({
    source: "fromForms",
    postData: {
      setting: connection.setting
    },
    callback: browserInfo => {
      connection.browserInfo = browserInfo;
    }
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
  formId
}: IEmailParams) => {
  client.mutate({
    mutation: gql(sendEmailMutation),
    variables: {
      toEmails,
      fromEmail,
      title,
      content,
      customerId: getLocalStorageItem("customerId"),
      formId
    }
  });
};

/*
 * Increasing view count
 */
export const increaseViewCount = (formId: string) => {
  return client.mutate({
    mutation: gql(increaseViewCountMutation),
    variables: {
      formId
    }
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
  saveCallback: (response: ISaveFormResponse) => void;
}) => {
  const { doc, browserInfo, integrationId, formId, saveCallback } = params;

  const submissions = Object.keys(doc).map(fieldId => {
    const { value, text, type, validation } = doc[fieldId];

    return {
      _id: fieldId,
      type,
      text,
      value,
      validation
    };
  });

  const variables = {
    integrationId,
    formId,
    browserInfo,
    submissions,
    cachedCustomerId: getLocalStorageItem("customerId")
  };

  client
    .mutate({
      mutation: gql(saveFormMutation),
      variables
    })

    .then(({ data }) => {
      if (data) {

        const {widgetsSaveLead} = data;
        saveCallback(widgetsSaveLead);

        if (widgetsSaveLead.customerId){
          setLocalStorageItem('customerId', widgetsSaveLead.customerId, connection.setting)
        }

        if (widgetsSaveLead && widgetsSaveLead.status === "ok") {
          postMessage({
            message: "formSuccess",
            variables
          });
        }
      }
    })

    .catch(e => {
      saveCallback({ status: "error", errors: [{ text: e.message }] });
    });
};
