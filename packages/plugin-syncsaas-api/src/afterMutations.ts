import { sendRequest } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';
import { customersEdit as customerEditQuery } from './common/customerQueries';
export default {
  'contacts:customer': ['update']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, object, updatedDocument } = params;
  const { _id } = object || {};

  if (
    !!Object.keys(updatedDocument)?.length &&
    action === 'update' &&
    type === 'contacts:customer'
  ) {
    const models = await generateModels(subdomain);

    const syncedCustomers = await models.SyncedCustomers.find({
      customerId: _id
    });

    const syncIds = syncedCustomers.map(
      syncedCustomer => syncedCustomer.syncId
    );

    if (!!syncedCustomers?.length) {
      const customerDoc = await models.Sync.getCustomerDoc(updatedDocument);

      const syncs = await models.Sync.find({ _id: syncIds });

      const responseDoc: any = {
        modifiedDocs: {
          count: 0,
          ids: []
        },
        errorDocs: {
          count: 0,
          ids: []
        }
      };

      for (const sync of syncs) {
        const { data, errors } = await sendRequest({
          url: `https://${sync.subdomain}.app.erxes.io/gateway/graphql`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'erxes-app-token': sync.appToken
          },
          body: {
            query: customerEditQuery,
            variables: {
              _id:
                syncedCustomers.find(
                  syncedCustomers => syncedCustomers.syncId === sync._id
                )?.syncedCustomerId || '',
              ...customerDoc
            }
          }
        });
        const { modifiedDocs, errorDocs } = responseDoc;

        if (errors || !data?.customersEdit) {
          responseDoc.errorDocs = {
            count: errorDocs.count + 1,
            ids: [...errorDocs.ids, _id]
          };

          continue;
        }

        responseDoc.modifiedDocs = {
          count: modifiedDocs.count + 1,
          ids: [...modifiedDocs.ids, _id]
        };
      }

      return responseDoc;
    }
  }
};
