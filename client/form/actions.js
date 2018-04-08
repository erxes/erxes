import gql from 'graphql-tag';
import {
  HIDE_CALLOUT,
  SHOW_CALLOUT,
  SHOW_FORM,
  HIDE_FORM,
  SHOW_POPUP,
  HIDE_POPUP,
  SUCCESS,
  ERROR,
  FORM_SUBMIT,
  CREATE_NEW,
  INITIAL,
} from './constants';
import client from '../apollo-client';
import { connection } from './connection';

/*
 * Send message to iframe's parent
 */
export const postMessage = (options) => {
  // notify parent window launcher state
  window.parent.postMessage({
    fromErxes: true,
    fromForms: true,
    setting: connection.setting,
    ...options
  }, '*');
};


/*
 * Decide which component will render initially
 */
export const init = () => (dispatch) => {
  const { data, hasPopupHandlers } = connection;
  const { formData } = data;
  const { loadType, callout } = formData;

  // if there is popup handler then do not show it initially
  if (loadType === 'popup' && hasPopupHandlers) {
    return null;
  }

  dispatch({ type: SHOW_POPUP });

  // if there is no callout setting then show form
  if (!callout) {
    return dispatch({ type: SHOW_FORM });
  }

  // If load type is shoutbox then hide form component initially
  if (callout.skip && loadType !== 'shoutbox') {
    return dispatch({ type: SHOW_FORM });
  }

  return dispatch({ type: SHOW_CALLOUT });
};

/*
 * Will be called when user click callout's submit button
 */
export const showForm = () => (dispatch) => {
  dispatch({ type: HIDE_CALLOUT });
  dispatch({ type: SHOW_FORM });
};

/*
 * Toggle circle button. Hide callout and show or hide form
 */
export const toggleShoutbox = (isVisible) => (dispatch) => {
  if(!isVisible) {
    // Increasing view count
    client.mutate({
      mutation: gql`
        mutation formIncreaseViewCount($formId: String!) {
          formIncreaseViewCount(formId: $formId)
        }`,

      variables: {
        formId: connection.data.formId,
      },
    });
  }

  dispatch({ type: HIDE_CALLOUT });
  dispatch({ type: isVisible ? HIDE_FORM : SHOW_FORM });
};

/*
 * When load type is popup, Show popup and show one of callout and form
 */
export const showPopup = () => (dispatch) => {
  const { data } = connection;
  const { formData } = data;
  const { callout } = formData;

  dispatch({ type: SHOW_POPUP });

  // if there is no callout setting then show form
  if (!callout) {
    return dispatch({ type: SHOW_FORM });
  }

  if (callout.skip) {
    return dispatch({ type: SHOW_FORM });
  }

  return dispatch({ type: SHOW_CALLOUT });
};

/*
 * When load type is popup, Hide popup
 */
export const closePopup = () => (dispatch) => {
  dispatch({ type: HIDE_POPUP });
  dispatch({ type: HIDE_CALLOUT });
  dispatch({ type: HIDE_FORM });

  // Increasing view count
  client.mutate({
    mutation: gql`
      mutation formIncreaseViewCount($formId: String!) {
        formIncreaseViewCount(formId: $formId)
      }`,

    variables: {
      formId: connection.data.formId,
    },
  });
};

/*
 * Get integration info using brand code and form code
 */
export const connect = (brandCode, formCode) =>
  client.mutate({
    mutation: gql`
      mutation formConnect($brandCode: String!, $formCode: String!) {
        formConnect(brandCode: $brandCode, formCode: $formCode) {
          integrationId,
          integrationName,
          languageCode,
          formId,
          formData,
        }
      }`,

    variables: {
      brandCode,
      formCode,
    },
  });


/*
 * Save user submissions
 */
export const saveForm = doc => (dispatch) => {
  const submissions = Object.keys(doc).map((fieldId) => {
    const { value, text, type, validation } = doc[fieldId];

    return {
      _id: fieldId,
      type,
      text,
      value,
      validation,
    };
  });

  client.mutate({
    mutation: gql`
      mutation saveForm($integrationId: String!, $formId: String!,
        $submissions: [FieldValueInput], $browserInfo: JSON!) {

        saveForm(integrationId: $integrationId, formId: $formId,
          submissions: $submissions, browserInfo: $browserInfo) {
            status
            messageId
            errors {
              fieldId
              code
              text
            }
        }
      }`,

    variables: {
      integrationId: connection.data.integrationId,
      formId: connection.data.formId,
      browserInfo: connection.setting.browserInfo,
      submissions,
    },
  })

  .then(({ data }) => {
    const { status, errors } = data.saveForm;

    dispatch({
      type: FORM_SUBMIT,
      status: status === 'ok' ? SUCCESS : ERROR,
      errors,
    });
  });
};

/*
 * Redisplay form component after submission
 */
export const createNew = () => (dispatch) => {
  dispatch({
    type: CREATE_NEW,
    status: INITIAL,
  });
};

/*
 * Send email to submitted user after successfull submission
 */
export const sendEmail = (toEmails, fromEmail, title, content) => () => {
  client.mutate({
    mutation: gql`
      mutation sendEmail($toEmails: [String], $fromEmail: String,
        $title: String, $content: String) {

        sendEmail(toEmails: $toEmails, fromEmail: $fromEmail,
          title: $title, content: $content)
      }`,

    variables: {
      toEmails,
      fromEmail,
      title,
      content,
    },
  });
};
