import * as moment from 'moment';
import {
  commonItemFieldsSchema,
  IStageDocument
} from '../../../db/models/definitions/boards';
import {
  brandSchema,
  IBrandDocument
} from '../../../db/models/definitions/brands';
import { channelSchema } from '../../../db/models/definitions/channels';
import {
  companySchema,
  ICompanyDocument
} from '../../../db/models/definitions/companies';
import {
  customerSchema,
  ICustomerDocument
} from '../../../db/models/definitions/customers';
import { IIntegrationDocument } from '../../../db/models/definitions/integrations';
import {
  IUserGroupDocument,
  permissionSchema
} from '../../../db/models/definitions/permissions';
import { IPipelineLabelDocument } from '../../../db/models/definitions/pipelineLabels';
import { ITagDocument } from '../../../db/models/definitions/tags';
import { ticketSchema } from '../../../db/models/definitions/tickets';
import {
  IUserDocument,
  userSchema
} from '../../../db/models/definitions/users';
import {
  Brands,
  Companies,
  Conformities,
  Customers,
  Integrations,
  PipelineLabels,
  Stages,
  Tags,
  Users,
  UsersGroups
} from '../../../db/models/index';

import { MODULE_NAMES } from '../../constants';
import {
  BOARD_BASIC_INFOS,
  BRAND_BASIC_INFOS,
  CHANNEL_BASIC_INFOS,
  COMPANY_BASIC_INFOS,
  CUSTOMER_BASIC_INFOS,
  PERMISSION_BASIC_INFOS,
  USER_BASIC_INFOS
} from './constants';

export interface IColumnLabel {
  name: string;
  label: string;
}

const findSchemaLabels = (
  schema: any,
  basicFields: string[]
): IColumnLabel[] => {
  const fields: IColumnLabel[] = [];

  for (const name of basicFields) {
    const field = schema.obj ? schema.obj[name] : schema[name];

    if (field && field.label) {
      fields.push({ name, label: field.label });
    } else {
      fields.push({ name, label: name });
    }
  }

  return fields;
};

export const fillHeaders = (itemType: string): IColumnLabel[] => {
  let columnNames: IColumnLabel[] = [];

  switch (itemType) {
    case MODULE_NAMES.COMPANY:
      columnNames = findSchemaLabels(companySchema, COMPANY_BASIC_INFOS);
      break;
    case MODULE_NAMES.CUSTOMER:
      columnNames = findSchemaLabels(customerSchema, CUSTOMER_BASIC_INFOS);
      break;
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
    case MODULE_NAMES.USER:
      columnNames = findSchemaLabels(userSchema, USER_BASIC_INFOS);
      break;
    case MODULE_NAMES.BRAND:
      columnNames = findSchemaLabels(brandSchema, BRAND_BASIC_INFOS);
      break;
    case MODULE_NAMES.CHANNEL:
      columnNames = findSchemaLabels(channelSchema, CHANNEL_BASIC_INFOS);
      break;
    case MODULE_NAMES.PERMISSION:
      columnNames = findSchemaLabels(permissionSchema, PERMISSION_BASIC_INFOS);
      break;
    default:
      break;
  }

  return columnNames;
};

const getCompanyNames = async _id => {
  const conformities = await Conformities.find({ mainTypeId: _id });
  const companyNames = [] as any;

  for (const conf of conformities) {
    const company: ICompanyDocument | null = await Companies.findOne({
      _id: conf.relTypeId
    });

    if (company) {
      companyNames.push(company.primaryName ? company.primaryName : 'unknown');
    }
  }

  return companyNames;
};

const getCellValue = (item, colName) => {
  const names = colName.split('.');

  if (names.length === 1) {
    return item[colName];
  } else if (names[0] === 'trackedData') {
    const trackedDatas = item.trackedData || [];

    if (trackedDatas[0]) {
      const foundedData = trackedDatas.find(data => data.field === names[1]);
      return foundedData ? foundedData.value : '';
    }

    return '';
  } else {
    const value = item[names[0]];

    return value ? value[names[1]] : '';
  }
};
/**
 * Finds given field of database collection row and format it in a human-friendly way.
 * @param {string} colName Database field name
 * @param {any} item Database row
 * @todo If same field names from different collections arrive, then this function will
 * not find the from the proper collection. As for now, those field names are defined
 * in distinctly defined static variables.
 */
export const fillCellValue = async (
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

    // user fields
    case 'brandIds':
      const brands: IBrandDocument[] = await Brands.find({
        _id: item.brandIds
      });

      cellValue = brands.map(brand => brand.name).join(', ');

      break;
    case 'groupIds':
      const groups: IUserGroupDocument[] = await UsersGroups.find({
        _id: { $in: item.groupIds }
      });

      cellValue = groups.map(g => g.name).join(', ');

      break;

    // channel fields
    case 'integrationIds':
      const integrations: IIntegrationDocument[] = await Integrations.find({
        _id: { $in: item.integrationIds }
      });

      cellValue = integrations.map(i => i.name).join(', ');

      break;
    case 'memberIds':
      const members: IUserDocument[] = await Users.find({
        _id: { $in: item.memberIds }
      });

      cellValue = members.map(m => m.username).join(', ');

      break;

    // permission fields
    case 'groupId':
      const group: IUserGroupDocument | null = await UsersGroups.findOne({
        _id: item.groupId
      });

      cellValue = group ? group.name : emptyMsg;

      break;
    case 'requiredActions':
      cellValue = (item.requiredActions || []).join(', ');

      break;
    // customer fields
    case 'integrationId':
      const integration: IIntegrationDocument | null = await Integrations.findOne(
        { _id: item.integrationId }
      );

      cellValue = integration ? integration.name : emptyMsg;

      break;
    case 'emails':
      cellValue = (item.emails || []).join(', ');
      break;
    case 'phones':
      cellValue = (item.phones || []).join(', ');
      break;
    case 'mergedIds':
      const customers: ICustomerDocument[] | null = await Customers.find({
        _id: { $in: item.mergedIds }
      });

      cellValue = customers
        .map(cus => cus.firstName || cus.primaryEmail)
        .join(', ');

      break;
    // company fields
    case 'names':
      cellValue = (item.names || []).join(', ');

      break;
    case 'parentCompanyId':
      const parent: ICompanyDocument | null = await Companies.findOne({
        _id: item.parentCompanyId
      });

      cellValue = parent ? parent.primaryName : '';

      break;

    case 'tag':
      const tag: ITagDocument | null = await Tags.findOne({ _id: item.tagId });

      cellValue = tag ? tag.name : '';

      break;

    case 'companiesPrimaryNames':
      const companyNames = await getCompanyNames(item._id);

      cellValue = companyNames.join(', ');

      break;

    case 'ownerEmail':
      const owner: IUserDocument | null = await Users.findOne({
        _id: item.ownerId
      });

      cellValue = owner ? owner.email : '';

      break;

    default:
      break;
  }

  return cellValue || emptyMsg;
};
