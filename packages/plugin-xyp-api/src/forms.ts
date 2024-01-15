import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';
import { IXypConfig } from './graphql/resolvers/queries';
import fetch from 'node-fetch';

export const getServiceToFields = async (subdomain) => {
  const xypConfigs = await sendCommonMessage({
    subdomain,
    serviceName: 'core',
    action: 'configs.findOne',
    data: {
      query: {
        code: 'XYP_CONFIGS',
      },
    },
    isRPC: true,
    defaultValue: null,
  });

  if (!xypConfigs) {
    throw new Error('Config not found');
  }

  const config: IXypConfig = xypConfigs && xypConfigs.value;

  const response = await fetch(config.url + '/list', {
    method: 'post',
    headers: { token: config.token },
    timeout: 9000,
  }).then((res) => res.json());
  const choosen = await sendCommonMessage({
    subdomain,
    serviceName: 'core',
    action: 'configs.findOne',
    data: {
      query: {
        code: 'XYP_CONFIGS',
      },
    },
    isRPC: true,
    defaultValue: null,
  });
  if (!choosen) {
    throw new Error('Config not found');
  }

  const list: any[] = [];
  let fieldsForExcel: any[] = [];
  choosen?.value?.servicelist.forEach((name) => {
    const element = response.find((x) => x.wsOperationName == name);
    fieldsForExcel = [
      ...fieldsForExcel,
      ...element.output.map(
        (x) => `${element.wsOperationName}.${x.wsResponseName}`,
      ),
    ];

    list.push({
      _id: Math.random(),
      name: `service.${element.wsOperationName}`,
      label: `${element.wsOperationDetail}`,
      type: 'string',
    });
  });

  return { fieldsForExcel, list };
};

export default {
  types: [{ description: 'Xyp', type: 'xyp_datas' }],
  fields: async ({ subdomain, data }) => {
    const { usageType } = data;
    const models = await generateModels(subdomain);

    const schema = models.XypData.schema as any;

    let fields: Array<{
      _id: number;
      name: string;
      group?: string;
      label?: string;
      type?: string;
      validation?: string;
      options?: string[];
      selectOptions?: Array<{ label: string; value: string }>;
    }> = [];

    fields = [];

    const { fieldsForExcel, list } =
      (await getServiceToFields(subdomain)) || [];

    if (schema) {
      fields = [...list, ...(await generateFieldsFromSchema(schema, ''))];
    }

    return fields;
  },
};
