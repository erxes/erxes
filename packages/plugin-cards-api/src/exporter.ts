import { generateModels, IModels } from './connectionResolver';
import { IMPORT_EXPORT_TYPES, MODULE_NAMES } from './constants';
import {
  fetchSegment,
  sendCoreMessage,
  sendFormsMessage,
  sendProductsMessage
} from './messageBroker';
import * as moment from 'moment';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { IPipelineLabelDocument } from './models/definitions/pipelineLabels';
import { IStageDocument } from './models/definitions/boards';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { contentType, segmentData } = query;

  let data: any[] = [];

  const type = contentType.split(':')[1];

  const boardItemsFilter: any = {};
  let itemIds = [];

  if (segmentData.conditions) {
    itemIds = await fetchSegment(
      subdomain,
      '',
      { scroll: true, page: 1, perPage: 10000 },
      segmentData
    );

    boardItemsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.DEAL:
      data = await models.Deals.find(boardItemsFilter).lean();

      break;
    case MODULE_NAMES.TASK:
      data = await models.Tasks.find(boardItemsFilter).lean();

      break;
    case MODULE_NAMES.TICKET:
      data = await models.Tickets.find(boardItemsFilter).lean();
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

const fillDealProductValue = async (subdomain, column, item) => {
  const productsData = item.productsData;
  let value;

  for (const productData of productsData) {
    let product;

    switch (column) {
      case 'productsData.amount':
        value = productData.amount;
        break;

      case 'productsData.name':
        product =
          (await sendProductsMessage({
            subdomain,
            action: 'findOne',
            data: {
              _id: productData.productId
            },
            isRPC: true
          })) || {};

        value = product.name;
        break;

      case 'productsData.code':
        product =
          (await sendProductsMessage({
            subdomain,
            action: 'findOne',
            data: {
              _id: productData.productId
            },
            isRPC: true
          })) || {};

        value = product.code;
        break;

      case 'productsData.discount':
        value = productData.discount;
        break;

      case 'productsData.discountPercent':
        value = productData.discountPercent;
        break;

      case 'productsData.currency':
        value = productData.amount;
        break;

      case 'productsData.tax':
        value = productData.tax;
        break;

      case 'productsData.taxPercent':
        value = productData.taxPercent;
        break;

      case 'productsData.quantity':
        value = productData.quantity;
        break;

      case 'productsData.unitPrice':
        value = productData.unitPrice;
        break;

      case 'productsData.tickUsed':
        value = productData.tickUsed;
        break;

      case 'productsData.maxQuantity':
        console.log('productData.maxQuantity', productData.maxQuantity);
        value = productData.maxQuantity;
        break;
    }
  }

  return { value };
};

const fillValue = async (
  models: IModels,
  subdomain: string,
  column: string,
  item: any
): Promise<string> => {
  let value = item[column];

  switch (column) {
    case 'createdAt':
    case 'closeDate':
    case 'modifiedAt':
      value = moment(value).format('YYYY-MM-DD HH:mm');

      break;
    case 'userId':
      const createdUser: IUserDocument | null = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: item.userId
        },
        isRPC: true
      });

      value = createdUser ? createdUser.username : 'user not found';

      break;
    // deal, task, ticket fields
    case 'assignedUserIds':
      const assignedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            _id: { $in: item.assignedUserIds || [] }
          }
        },
        isRPC: true,
        defaultValue: []
      });

      value = assignedUsers.map(user => user.username || user.email).join(', ');

      break;

    case 'watchedUserIds':
      const watchedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            _id: { $in: item.watchedUserIds || [] }
          }
        },
        isRPC: true,
        defaultValue: []
      });

      value = watchedUsers.map(user => user.username || user.email).join(', ');

      break;

    case 'labelIds':
      const labels: IPipelineLabelDocument[] = await models.PipelineLabels.find(
        {
          _id: { $in: item.labelIds }
        }
      );

      value = labels.map(label => label.name).join(', ');

      break;
    case 'stageId':
      const stage: IStageDocument | null = await models.Stages.findOne({
        _id: item.stageId
      });

      value = stage ? stage.name : '-';

      break;

    case 'boardId':
      const stageForBoard = await models.Stages.findOne({
        _id: item.stageId
      });

      value = '-';

      if (stageForBoard) {
        const pipeline = await models.Pipelines.findOne({
          _id: stageForBoard.pipelineId
        });

        if (pipeline) {
          const board = await models.Boards.findOne({ _id: pipeline.boardId });

          value = board ? board.name : '-';
        }
      }

      break;

    case 'pipelineId':
      const stageForPipeline = await models.Stages.findOne({
        _id: item.stageId
      });

      value = '-';

      if (stageForPipeline) {
        const pipeline = await models.Pipelines.findOne({
          _id: stageForPipeline.pipelineId
        });

        value = pipeline ? pipeline.name : '-';
      }

      break;

    case 'initialStageId':
      const initialStage: IStageDocument | null = await models.Stages.findOne({
        _id: item.initialStageId
      });

      value = initialStage ? initialStage.name : '-';

      break;

    case 'modifiedBy':
      const modifiedBy: IUserDocument | null = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: item.modifiedBy
        },
        isRPC: true
      });

      value = modifiedBy ? modifiedBy.username : '-';

      break;

    default:
      break;
  }

  return value || '-';
};

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,

  prepareExportData: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig } = data;

    const docs = [] as any;
    const headers = [] as any;
    const excelHeader = [] as any;

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
        } else if (column.startsWith('productsData')) {
          headers.push(column);
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

            result[fieldName] = value || '-';
          } else if (column.startsWith('productsData')) {
            const { value } = await fillDealProductValue(
              subdomain,
              column,
              item
            );

            result[column] = value || '-';
          } else {
            const value = await fillValue(models, subdomain, column, item);

            result[column] = value || '-';
          }
        }

        docs.push(result);
      }

      for (const header of headers) {
        if (header.startsWith('customFieldsData')) {
          excelHeader.push(header.split('.')[1]);
        } else {
          excelHeader.push(header);
        }
      }
    } catch (e) {
      return { error: e.message };
    }
    return { docs, excelHeader };
  }
};
