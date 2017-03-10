import _ from 'underscore';
import gql from 'graphql-tag';
import { FORM_TOGGLE, FORM_SENT, STATUS_CHANGED } from '../constants';
import client from '../../apollo-client';
import { connection } from '../connection';

export const toggle = (isVisible) => {
  // notify parent window launcher state
  window.parent.postMessage({
    fromErxes: true,
    isFormVisible: isVisible,
  }, '*');

  return {
    type: FORM_TOGGLE,
  };
};

export const saveForm = doc => (dispatch) => {
  const values = _.map(_.keys(doc), (fieldId) => {
    const { value, text } = doc[fieldId];

    return {
      _id: fieldId,
      text,
      value,
    };
  });

  client.mutate({
    mutation: gql`
      mutation saveForm($integrationId: String!, $formId: String!, $values: [FieldValueInput]) {
        saveForm(integrationId: $integrationId, formId: $formId, values: $values) {
          errors
        }
      }`,

    variables: {
      integrationId: connection.data.integrationId,
      formId: connection.data.formId,
      values,
    },
  })

  .then(() => {
    // notify as sent
    dispatch({
      type: STATUS_CHANGED,
      status: FORM_SENT,
    });
  });
};
