import { Forms } from './connectors';
import { getIntegration, createConversation, createMessage } from './utils';

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
    const { integrationId, formId, values } = args;

    return Forms.findOne({ _id: formId })
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
  },
};
