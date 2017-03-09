import { getIntegration } from './utils';

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
};
