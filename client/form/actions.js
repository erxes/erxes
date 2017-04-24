import _ from 'underscore';
import gql from 'graphql-tag';
import {
  SHOUTBOX_FORM_TOGGLE,
  SUCCESS,
  ERROR,
  FORM_SUBMIT,
  CREATE_NEW,
  INITIAL,
} from './constants';
import client from '../apollo-client';
import { connection } from './connection';

export const toggleShoutbox = (isVisible) => {
  // notify parent window launcher state
  window.parent.postMessage({
    fromErxes: true,
    fromShoutbox: true,
    isVisible: !isVisible,
  }, '*');

  return {
    type: SHOUTBOX_FORM_TOGGLE,
    isVisible: !isVisible,
  };
};


export const closeModal = () => {
  // notify parent window that close modal
  window.parent.postMessage({
    fromErxes: true,
    closeModal: true,
  }, '*');
};


export const connect = (brandCode, formCode) =>
  client.mutate({
    mutation: gql`
      mutation formConnect($brandCode: String!, $formCode: String!) {
        formConnect(brandCode: $brandCode, formCode: $formCode) {
          integrationId,
          integrationName,
          formId,
          formLoadType
        }
      }`,

    variables: {
      brandCode,
      formCode,
    },
  });

export const saveForm = doc => (dispatch) => {
  const submissions = _.map(_.keys(doc), (fieldId) => {
    const { value, text, type } = doc[fieldId];

    return {
      _id: fieldId,
      type,
      text,
      value,
    };
  });

  client.mutate({
    mutation: gql`
      mutation saveForm($integrationId: String!, $formId: String!, $submissions: [FieldValueInput]) {
        saveForm(integrationId: $integrationId, formId: $formId, submissions: $submissions) {
          fieldId
          code
          text
        }
      }`,

    variables: {
      integrationId: connection.data.integrationId,
      formId: connection.data.formId,
      submissions,
    },
  })

  .then(({ data }) => {
    const errors = data.saveForm;

    let status = SUCCESS;

    if (errors.length > 0) {
      status = ERROR;
    }

    dispatch({
      type: FORM_SUBMIT,
      status,
      errors,
    });
  });
};

export const createNew = () => (dispatch) => {
  dispatch({
    type: CREATE_NEW,
    status: INITIAL,
  });
};
