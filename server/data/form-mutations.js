import _ from 'underscore';
import { Forms, FormFields } from './connectors';
import { getIntegration, createConversation, createMessage } from './utils';

export const validate = (submissions, formId) =>
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


const saveValues = ({ integrationId, values, formId }) =>
  Forms.findOne({ _id: formId })
    .then((form) => {
      const content = form.title;

      // create conversation
      createConversation({
        integrationId,
        content,
      })

      // create message
      .then(conversationId =>
        createMessage({
          conversationId,
          message: content,
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

  /*
   * Create new conversation using form data
   */
  saveForm(root, args) {
    const { formId, values } = args;

    return validate(values, formId).then((errors) => {
      if (errors.length > 0) {
        return errors;
      }

      return saveValues(args).then(() => []);
    });
  },
};
