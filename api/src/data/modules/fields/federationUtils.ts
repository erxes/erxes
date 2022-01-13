import { Deals } from '../../../db/models';
import {
  generateConfigOptions,
  generateProductsOptions,
  generateUsersOptions,
  getIntegrations
} from './utils';

export const getPluginSchema = async (
  pluginName: string,
  pluginContentType: string
) => {
  const PLUGINS = [
    {
      pluginName: 'deal',
      mongoUrl: 'mongodb://localhost/erxes-sales',
      schema: Deals.schema
    }
  ];

  const plugin = PLUGINS.find(item => {
    return item.pluginName === pluginName;
  });

  console.log(pluginContentType);

  return plugin?.schema;
};

// const getStageOptions = async pipelineId => {
//   const stages = await Stages.find({ pipelineId });
//   const options: Array<{ label: string; value: any }> = [];

//   for (const stage of stages) {
//     options.push({
//       value: stage._id,
//       label: stage.name || ''
//     });
//   }

//   return {
//     _id: Math.random(),
//     name: 'stageId',
//     label: 'Stage',
//     type: 'stage',
//     selectOptions: options
//   };
// };

// const getPipelineLabelOptions = async pipelineId => {
//   const labels = await PipelineLabels.find({ pipelineId });
//   const options: Array<{ label: string; value: any }> = [];

//   for (const label of labels) {
//     options.push({
//       value: label._id,
//       label: label.name
//     });
//   }

//   return {
//     _id: Math.random(),
//     name: 'labelIds',
//     label: 'Labels',
//     type: 'label',
//     selectOptions: options
//   };
// };

export const custom = async (pluginName, pluginContentType) => {
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

  console.log(pluginName);

  if (pluginContentType === 'deal') {
    const productOptions = await generateProductsOptions(
      'productsData.productId',
      'Product',
      'product'
    );

    const assignedUserOptions = await generateUsersOptions(
      'productsData.assignUserId',
      'Assigned to (product)',
      'user'
    );

    const uomOptions = await generateConfigOptions(
      'productsData.uom',
      'UOM',
      'uom',
      'dealUOM'
    );

    const currenciesOptions = await generateConfigOptions(
      'productsData.currency',
      'Currency',
      'currency',
      'dealCurrency'
    );

    fields = [
      ...fields,
      ...[productOptions, assignedUserOptions, uomOptions, currenciesOptions]
    ];
  }

  if (['deal', 'task', 'ticket'].includes(pluginContentType)) {
    const createdByOptions = await generateUsersOptions(
      'userId',
      'Created by',
      'user'
    );

    const modifiedByOptions = await generateUsersOptions(
      'modifiedBy',
      'Modified by',
      'user'
    );

    const assignedUserOptions = await generateUsersOptions(
      'assignedUserIds',
      'Assigned to',
      'user'
    );

    const watchedUserOptions = await generateUsersOptions(
      'watchedUserIds',
      'Watched users',
      'user'
    );

    // if (segmentId || pipelineId) {
    //   const segment = segmentId ? await getSegment(segmentId) : null;

    //   const labelOptions = await getPipelineLabelOptions(
    //     pipelineId || (segment ? segment.pipelineId : null)
    //   );

    //   const stageOptions = await getStageOptions(
    //     pipelineId || (segment ? segment.pipelineId : null)
    //   );

    //   fields = [...fields, stageOptions, labelOptions];
    // } else {
    //   const stageOptions = {
    //     _id: Math.random(),
    //     name: 'stageId',
    //     label: 'Stage',
    //     type: 'stage'
    //   };

    //   fields = [...fields, stageOptions];
    // }

    fields = [
      ...fields,
      ...[
        createdByOptions,
        modifiedByOptions,
        assignedUserOptions,
        watchedUserOptions
      ]
    ];
  }

  if (pluginContentType === 'conversation') {
    const integrations = await getIntegrations();

    fields.push({
      _id: Math.random(),
      name: 'integrationId',
      label: 'Related integration',
      selectOptions: integrations
    });

    const assignedUserOptions = await generateUsersOptions(
      'assignedUserId',
      'Assigned to',
      'user'
    );

    const participatedUserOptions = await generateUsersOptions(
      'participatedUserIds',
      'Participating team member',
      'user'
    );

    const closedUserOptions = await generateUsersOptions(
      'closedUserId',
      'Resolved by',
      'user'
    );

    fields = [
      ...fields,
      ...[participatedUserOptions, assignedUserOptions, closedUserOptions]
    ];
  }

  return fields;
};
