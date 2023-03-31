import { generateModels } from './connectionResolver';
import { sendFormsMessage } from './messageBroker';

export default {
  editorAttributes: async ({ subdomain, data: { contentType } }) => {
    console.log(contentType);
    const fields = await sendFormsMessage({
      subdomain,
      action: 'fields.fieldsCombinedByContentType',
      isRPC: true,
      data: {
        contentType
      },
      defaultValue: []
    });
    return fields.map(f => ({ value: f.name, name: f.label }));
  },
  replaceContent: async ({ subdomain, data: {} }) => {
    const models = await generateModels(subdomain);
  }
};
