import _ from 'underscore';
import { Forms, FormFields } from './connectors';
import { getIntegration, createConversation, createMessage } from './utils';

export const validate = (formId, submissions) =>
  FormFields.find({ formId })
    .then((fields) => {
      const errors = [];

      _.each(fields, (field) => {
        // find submission object by _id
        const submission = _.find(submissions, sub => sub._id === field._id);

        if (field.isRequired && !submission.value) {
          errors.push({ fieldId: field._id, code: 'required', text: 'Required' });
        }
      });

      return errors;
    });


export const saveValues = ({ integrationId, values, formId }) =>
  Forms.findOne({ _id: formId })
    .then((form) => {
      const content = form.title;

      // create conversation
      return createConversation({
        integrationId,
        content,
      })

      // create message
      .then(conversationId =>
        createMessage({
          conversationId,
          content,
          formWidgetData: values,
        }),
      )

      // catch exception
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
      });
    });

export default {
  // Find integrationId by brandCode
  formConnect(root, args) {
    return getIntegration(args.brandCode, 'form')
      .then(integ => ({ integrationId: integ._id, formId: integ.formId }))

      // catch exception
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
      });
  },

  // create new conversation using form data
  saveForm(root, args) {
    const { formId, values } = args;

    return validate(formId, values).then((errors) => {
      if (errors.length > 0) {
        return errors;
      }

      return saveValues(args).then(() => []);
    });
  },
};
