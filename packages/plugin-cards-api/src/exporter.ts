import { can, IColumnLabel } from '@erxes/api-utils/src';
import {
  createXlsFile,
  findSchemaLabels,
  generateXlsx,
  getCustomFieldsData
} from '@erxes/api-utils/src/exporter';
import { IUserDocument } from '@erxes/api-utils/src/types';
import * as moment from 'moment';
import { Fields, Segments, Users } from './apiCollections';
import { BOARD_BASIC_INFOS, MODULE_NAMES } from './constants';
import { fetchSegment } from './messageBroker';
import { Deals, PipelineLabels, Stages, Tasks, Tickets } from './models';
import {
  commonItemFieldsSchema,
  IStageDocument
} from './models/definitions/boards';
import { IPipelineLabelDocument } from './models/definitions/pipelineLabels';
import { ticketSchema } from './models/definitions/tickets';

export const fillHeaders = (itemType: string): IColumnLabel[] => {
  let columnNames: IColumnLabel[] = [];

  switch (itemType) {
    case MODULE_NAMES.DEAL:
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

const fillCellValue = async (colName: string, item: any): Promise<string> => {
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
      const createdUser: IUserDocument | null = await Users.findOne({
        _id: item.userId
      });

      cellValue = createdUser ? createdUser.username : 'user not found';

      break;
    // deal, task, ticket fields
    case 'assignedUserIds':
      const assignedUsers: IUserDocument[] = await Users.find({
        _id: { $in: item.assignedUserIds }
      });

      cellValue = assignedUsers
        .map(user => user.username || user.email)
        .join(', ');

      break;

    case 'watchedUserIds':
      const watchedUsers: IUserDocument[] = await Users.find({
        _id: { $in: item.watchedUserIds }
      });

      cellValue = watchedUsers
        .map(user => user.username || user.email)
        .join(', ');

      break;

    case 'labelIds':
      const labels: IPipelineLabelDocument[] = await PipelineLabels.find({
        _id: { $in: item.labelIds }
      });

      cellValue = labels.map(label => label.name).join(', ');

      break;
    case 'stageId':
      const stage: IStageDocument | null = await Stages.findOne({
        _id: item.stageId
      });

      cellValue = stage ? stage.name : emptyMsg;

      break;

    case 'initialStageId':
      const initialStage: IStageDocument | null = await Stages.findOne({
        _id: item.initialStageId
      });

      cellValue = initialStage ? initialStage.name : emptyMsg;

      break;

    case 'modifiedBy':
      const modifiedBy: IUserDocument | null = await Users.findOne({
        _id: item.modifiedBy
      });

      cellValue = modifiedBy ? modifiedBy.username : emptyMsg;

      break;

    default:
      break;
  }

  return cellValue || emptyMsg;
};

const prepareData = async (query: any, user: IUserDocument): Promise<any[]> => {
  const { type, segment } = query;

  let data: any[] = [];

  const boardItemsFilter: any = {};

  const segmentObj = await Segments.findOne({ _id: segment });

  if (segment) {
    const itemIds = await fetchSegment(segmentObj);

    boardItemsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.DEAL:
      if (!(await can('exportDeals', user))) {
        throw new Error('Permission denied');
      }

      data = await Deals.find(boardItemsFilter);

      break;
    case MODULE_NAMES.TASK:
      if (!(await can('exportTasks', user))) {
        throw new Error('Permission denied');
      }

      data = await Tasks.find(boardItemsFilter);

      break;
    case MODULE_NAMES.TICKET:
      if (!(await can('exportTickets', user))) {
        throw new Error('Permission denied');
      }

      data = await Tickets.find(boardItemsFilter);
      break;
  }

  return data;
};

const addCell = (
  col: any,
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

export const buildFile = async (
  query: any,
  user: IUserDocument
): Promise<{ name: string; response: string }> => {
  const { configs } = query;
  const type = query.type;

  const data = await prepareData(query, user);

  // Reads default template
  const { workbook, sheet } = await createXlsFile();

  const columnNames: string[] = [];
  let rowIndex: number = 1;

  let headers: IColumnLabel[] = fillHeaders(type);

  if (configs) {
    headers = JSON.parse(configs);
  }

  for (const item of data) {
    rowIndex++;
    // Iterating through basic info columns
    for (const column of headers) {
      if (column.name.startsWith('customFieldsData')) {
        const { field, value } = await getCustomFieldsData(
          Fields,
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
      } else {
        const cellValue = await fillCellValue(column.name, item);

        addCell(column, cellValue, sheet, columnNames, rowIndex);
      }
    }

    // customer or company checking
  } // end items for loop

  return {
    name: `${type} - ${moment().format('YYYY-MM-DD HH:mm')}`,
    response: await generateXlsx(workbook)
  };
};
