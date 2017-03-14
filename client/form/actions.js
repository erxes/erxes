import _ from 'underscore';
import gql from 'graphql-tag';
import { FORM_TOGGLE, SUCCESS, ERROR, FORM_SUBMITTED } from './constants';
import client from '../apollo-client';
import { connection } from './connection';

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
          fieldId
          code
          text
        }
      }`,

    variables: {
      integrationId: connection.data.integrationId,
      formId: connection.data.formId,
      values,
    },
  })

  .then(({ data }) => {
    const errors = data.saveForm;

    let status = SUCCESS;

    if (errors.length > 0) {
      status = ERROR;
    }

    dispatch({
      type: FORM_SUBMITTED,
      status,
      errors,
    });
  });
};
