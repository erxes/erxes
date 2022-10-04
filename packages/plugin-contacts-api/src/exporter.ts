import { generateModels, IModels } from './connectionResolver';
import { EXPORT_TYPES, MODULE_NAMES } from './constants';
import {
  fetchSegment,
  sendFormsMessage,
  sendInboxMessage
} from './messageBroker';
import {
  Builder as CompanyBuildQuery,
  IListArgs as ICompanyListArgs
} from './coc/companies';
import {
  Builder as CustomerBuildQuery,
  IListArgs as ICustomerListArgs
} from './coc/customers';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { contentType, unlimited = true, segment } = query;

  const type = contentType.split(':')[1];

  let data: any[] = [];

  const boardItemsFilter: any = {};

  if (segment) {
    const itemIds = await fetchSegment(subdomain, segment);

    boardItemsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.COMPANY:
      const companyParams: ICompanyListArgs = query;

      const companyQb = new CompanyBuildQuery(
        models,
        subdomain,
        companyParams,
        {}
      );
      await companyQb.buildAllQueries();

      const companyResponse = await companyQb.runQueries('search', unlimited);

      data = companyResponse.list;

      break;

    case 'lead':
      const leadParams: ICustomerListArgs = query;
      const leadQp = new CustomerBuildQuery(models, subdomain, leadParams, {});
      await leadQp.buildAllQueries();

      const leadResponse = await leadQp.runQueries('search');

      data = leadResponse.list;
      break;

    case 'visitor':
      const visitorParams: ICustomerListArgs = query;
      const visitorQp = new CustomerBuildQuery(
        models,
        subdomain,
        visitorParams,
        {}
      );
      await visitorQp.buildAllQueries();

      const visitorResponse = await visitorQp.runQueries('search', unlimited);

      data = visitorResponse.list;
      break;

    case MODULE_NAMES.CUSTOMER:
      const customerParams: ICustomerListArgs = query;

      if (customerParams.form && customerParams.popupData) {
        const fields = await sendFormsMessage({
          subdomain,
          action: 'fields.find',
          data: {
            query: {
              contentType: 'form',
              contentTypeId: customerParams.form
            }
          },
          isRPC: true,
          defaultValue: []
        });

        if (fields.length === 0) {
          return [];
        }

        const messageQuery: any = {
          'formWidgetData._id': { $in: fields.map(field => field._id) },
          customerId: { $exists: true }
        };

        const messages = await sendInboxMessage({
          subdomain,
          action: 'conversationMessages.find',
          data: messageQuery,
          isRPC: true,
          defaultValue: []
        });

        const messagesMap: { [key: string]: any[] } = {};

        for (const message of messages) {
          const customerId = message.customerId || '';

          if (!messagesMap[customerId]) {
            messagesMap[customerId] = [];
          }

          messagesMap[customerId].push({
            datas: message.formWidgetData,
            createdInfo: {
              _id: 'created',
              type: 'input',
              validation: 'date',
              text: 'Created',
              value: message.createdAt
            }
          });
        }

        const formSubmissions = await sendFormsMessage({
          subdomain,
          action: 'submissions.find',
          data: {
            query: {
              formId: customerParams.form
            }
          },
          isRPC: true,
          defaultValue: []
        });

        const customerIds = formSubmissions.map(
          submission => submission.customerId
        );

        const uniqueCustomerIds = [...new Set(customerIds)] as any;

        const formDatas: any[] = [];

        for (const customerId of uniqueCustomerIds) {
          const filteredMessages = messagesMap[customerId] || [];

          for (const { datas, createdInfo } of filteredMessages) {
            const formData: any[] = datas;

            formData.push(createdInfo);

            formDatas.push(formData);
          }
        }
        data = formDatas;
      } else {
        const qb = new CustomerBuildQuery(
          models,
          subdomain,
          customerParams,
          {}
        );
        await qb.buildAllQueries();

        const customerResponse = await qb.runQueries('search', unlimited);

        data = customerResponse.list;
      }

      break;

    default:
      break;
  }

  return data;
};

const getCustomFieldsData = async (item, fieldId) => {
  let value;

  if (item.customFieldsData && item.customFieldsData.length > 0) {
    for (const customFeild of item.customFieldsData) {
      if (customFeild.field === fieldId) {
        value = customFeild.value;

        if (Array.isArray(value)) {
          value = value.join(', ');
        }

        return { value };
      }
    }
  }

  return { value };
};

export default {
  exportTypes: EXPORT_TYPES,

  prepareExportData: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig, contentType } = data;

    const docs = [] as any;
    const headers = [] as any;

    try {
      const results = await prepareData(models, subdomain, data);

      for (const column of columnsConfig) {
        if (column.startsWith('customFieldsData')) {
          const fieldId = column.split('.')[1];
          const field = await sendFormsMessage({
            subdomain,
            action: 'fields.findOne',
            data: {
              query: { _id: fieldId }
            },
            isRPC: true
          });

          headers.push(`customFieldsData.${field.text}.${fieldId}`);
        } else {
          headers.push(column);
        }
      }

      for (const item of results) {
        const result = {};

        for (const column of headers) {
          if (column.startsWith('customFieldsData')) {
            const fieldId = column.split('.')[2];
            const fieldName = column.split('.')[1];

            const { value } = await getCustomFieldsData(item, fieldId);

            result[column] = value || '-';
          } else if (column.startsWith('location')) {
            const location = item.location || {};

            result[column] = location[column.split('.')[1]];
          } else {
            result[column] = item[column];
          }
        }

        docs.push(result);
      }
    } catch (e) {
      return { error: e.message };
    }
    return { docs, headers };
  }
};
