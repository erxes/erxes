import * as xlsxPopulate from 'xlsx-populate';
import { IColumnLabel } from '@erxes/api-utils/src';
import {
  findSchemaLabels,
  getCustomFieldsData
} from '@erxes/api-utils/src/exporter';
import { IUserDocument } from '@erxes/api-utils/src/types';
import * as moment from 'moment';
import { IModels } from './connectionResolver';
import { BOARD_BASIC_INFOS, MODULE_NAMES } from './constants';
import {
  fetchSegment,
  sendCoreMessage,
  sendFormsMessage,
  sendProductsMessage
} from './messageBroker';
import {
  commonItemFieldsSchema,
  IStageDocument
} from './models/definitions/boards';
import { IPipelineLabelDocument } from './models/definitions/pipelineLabels';
import { ticketSchema } from './models/definitions/tickets';

export const createXlsFile = async () => {
  // Generating blank workbook
  const workbook = await xlsxPopulate.fromBlankAsync();

  return { workbook, sheet: workbook.sheet(0) };
};

/**
 * Generates downloadable xls file on the url
 */
export const generateXlsx = async (workbook: any): Promise<string> => {
  return workbook.outputAsync();
};

const filterHeaders = headers => {
  const first = [] as any;
  const others = [] as any;

  for (const column of headers) {
    if (column.name.startsWith('productsData')) {
      first.push(column);
    } else {
      others.push(column);
    }
  }

  return others.concat(first);
};

export const fillHeaders = (itemType: string): IColumnLabel[] => {
  let columnNames: IColumnLabel[] = [];

  switch (itemType) {
    case MODULE_NAMES.DEAL:
    case MODULE_NAMES.PURCHASE:
    case MODULE_NAMES.TASK:
      columnNames = findSchemaLabels(commonItemFieldsSchema, BOARD_BASIC_INFOS);
      break;
    case MODULE_NAMES.TICKET:
      columnNames = findSchemaLabels(ticketSchema, [
        ...BOARD_BASIC_INFOS,
        'source'
      ]);
      break;

    default:
      break;
  }

  return columnNames;
};

const getCellValue = (item, colName) => {
  const names = colName.split('.');

  if (names.length === 1) {
    return item[colName];
  } else {
    const value = item[names[0]];

    return value ? value[names[1]] : '';
  }
};

const fillCellValue = async (
  models: IModels,
  subdomain: string,
  colName: string,
  item: any
): Promise<string> => {
  const emptyMsg = '-';

  if (!item) {
    return emptyMsg;
  }

  let cellValue: any = getCellValue(item, colName);

  if (typeof item[colName] === 'boolean') {
    cellValue = item[colName] ? 'Yes' : 'No';
  }

  switch (colName) {
    case 'createdAt':
    case 'closeDate':
    case 'modifiedAt':
      cellValue = moment(cellValue).format('YYYY-MM-DD HH:mm');

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

      cellValue = createdUser ? createdUser.username : 'user not found';

      break;
    // deal, purchase ,task, ticket fields
    case 'assignedUserIds':
      const assignedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            _id: { $in: item.assignedUserIds }
          }
        },
        isRPC: true,
        defaultValue: []
      });

      cellValue = assignedUsers
        .map(user => user.username || user.email)
        .join(', ');

      break;

    case 'watchedUserIds':
      const watchedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            _id: { $in: item.watchedUserIds }
          }
        },
        isRPC: true,
        defaultValue: []
      });

      cellValue = watchedUsers
        .map(user => user.username || user.email)
        .join(', ');

      break;

    case 'labelIds':
      const labels: IPipelineLabelDocument[] = await models.PipelineLabels.find(
        {
          _id: { $in: item.labelIds }
        }
      );

      cellValue = labels.map(label => label.name).join(', ');

      break;
    case 'stageId':
      const stage: IStageDocument | null = await models.Stages.findOne({
        _id: item.stageId
      });

      cellValue = stage ? stage.name : emptyMsg;

      break;

    case 'boardId':
      const stageForBoard = await models.Stages.findOne({
        _id: item.stageId
      });

      cellValue = emptyMsg;

      if (stageForBoard) {
        const pipeline = await models.Pipelines.findOne({
          _id: stageForBoard.pipelineId
        });

        if (pipeline) {
          const board = await models.Boards.findOne({ _id: pipeline.boardId });

          cellValue = board ? board.name : emptyMsg;
        }
      }

      break;

    case 'pipelineId':
      const stageForPipeline = await models.Stages.findOne({
        _id: item.stageId
      });

      cellValue = emptyMsg;

      if (stageForPipeline) {
        const pipeline = await models.Pipelines.findOne({
          _id: stageForPipeline.pipelineId
        });

        cellValue = pipeline ? pipeline.name : emptyMsg;
      }

      break;

    case 'initialStageId':
      const initialStage: IStageDocument | null = await models.Stages.findOne({
        _id: item.initialStageId
      });

      cellValue = initialStage ? initialStage.name : emptyMsg;

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

      cellValue = modifiedBy ? modifiedBy.username : emptyMsg;

      break;

    default:
      break;
  }

  return cellValue || emptyMsg;
};

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { type, segmentData } = query;

  let data: any[] = [];

  const boardItemsFilter: any = {};

  if (segmentData) {
    const itemIds = await fetchSegment(subdomain, '', {}, segmentData);

    boardItemsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.DEAL:
      data = await models.Deals.find(boardItemsFilter);

      break;
    case MODULE_NAMES.PURCHASE:
      data = await models.Purchases.find(boardItemsFilter);

      break;
    case MODULE_NAMES.TASK:
      data = await models.Tasks.find(boardItemsFilter);

      break;
    case MODULE_NAMES.TICKET:
      data = await models.Tickets.find(boardItemsFilter);
      break;
  }

  return data;
};

const addCell = (
  col: IColumnLabel,
  value: string,
  sheet: any,
  columnNames: string[],
  rowIndex: number
): void => {
  // Checking if existing column
  if (columnNames.includes(col.name)) {
    // If column already exists adding cell
    sheet.cell(rowIndex, columnNames.indexOf(col.name) + 1).value(value);
  } else {
    // Creating column
    sheet.cell(1, columnNames.length + 1).value(col.label || col.name);
    // Creating cell
    sheet.cell(rowIndex, columnNames.length + 1).value(value);

    columnNames.push(col.name);
  }
};

const fillDealProductValue = async (
  subdomain,
  column,
  item,
  sheet,
  columnNames,
  rowIndex,
  dealIds,
  dealRowIndex
) => {
  const productsData = item.productsData;

  if (productsData.length === 0) {
    rowIndex++;
    dealRowIndex++;

    addCell(column, '-', sheet, columnNames, dealRowIndex);

    return { rowIndex, dealRowIndex };
  }

  if (dealIds.length === 0) {
    dealIds.push(item._id);
  } else if (!dealIds.includes(item._id)) {
    dealIds.push(item._id);
    rowIndex = dealRowIndex;
  }

  dealRowIndex = rowIndex;

  for (const productData of productsData) {
    let cellValue = '';
    let product;

    switch (column.name) {
      case 'productsData.amount':
        cellValue = productData.amount;
        break;

      case 'productsData.name':
        product =
          (await sendProductsMessage({
            subdomain,
            action: 'findOne',
            data: { _id: productData.productId },
            isRPC: true
          })) || {};

        cellValue = product.name;
        break;

      case 'productsData.code':
        product =
          (await sendProductsMessage({
            subdomain,
            action: 'findOne',
            data: { _id: productData.productId },
            isRPC: true
          })) || {};

        cellValue = product.code;
        break;

      case 'productsData.discount':
        cellValue = productData.discount;
        break;

      case 'productsData.discountPercent':
        cellValue = productData.discountPercent;
        break;

      case 'productsData.currency':
        cellValue = productData.amount;
        break;

      case 'productsData.tax':
        cellValue = productData.tax;
        break;

      case 'productsData.taxPercent':
        cellValue = productData.taxPercent;
        break;
    }

    if (cellValue) {
      addCell(column, cellValue, sheet, columnNames, dealRowIndex);

      dealRowIndex++;
    }
  }

  return { rowIndex, dealRowIndex };
};

export const buildFile = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<{ name: string; response: string }> => {
  const { configs, type } = query;

  const data = await prepareData(models, subdomain, query);

  // Reads default template
  const { workbook, sheet } = await createXlsFile();

  const columnNames: string[] = [];
  let rowIndex: number = 1;
  const dealIds: string[] = [];
  let dealRowIndex: number = 0;

  let headers: IColumnLabel[] = fillHeaders(type);

  if (configs) {
    headers = JSON.parse(configs).map(config => {
      return { name: config, label: config };
    });
  }

  if (type === MODULE_NAMES.DEAL) {
    headers = filterHeaders(headers);
  }

  for (const item of data) {
    rowIndex++;
    // Iterating through basic info columns
    for (const column of headers) {
      if (column.name.startsWith('customFieldsData')) {
        const fieldId = column.name.split('.')[1];
        const { field, value } = await getCustomFieldsData(
          () =>
            sendFormsMessage({
              subdomain,
              action: 'fields.findOne',
              data: {
                query: { _id: fieldId }
              },
              isRPC: true
            }),
          item,
          column,
          type
        );

        if (field && value) {
          addCell(
            { name: field.text, label: field.text },
            value,
            sheet,
            columnNames,
            rowIndex
          );
        }
      } else if (column.name.startsWith('productsData')) {
        const indexes = await fillDealProductValue(
          subdomain,
          column,
          item,
          sheet,
          columnNames,
          rowIndex,
          dealIds,
          dealRowIndex
        );

        rowIndex = indexes?.rowIndex;
        dealRowIndex = indexes?.dealRowIndex;
      } else {
        let index = rowIndex;
        if (type === MODULE_NAMES.DEAL) {
          index = dealRowIndex === 0 ? rowIndex : dealRowIndex;
        }

        const cellValue = await fillCellValue(
          models,
          subdomain,
          column.name,
          item
        );

        addCell(column, cellValue, sheet, columnNames, index);
      }
    }

    // customer or company checking
  } // end items for loop

  return {
    name: `${type} - ${moment().format('YYYY-MM-DD HH:mm')}`,
    response: await generateXlsx(workbook)
  };
};
