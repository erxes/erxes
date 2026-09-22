import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IReportFilterParams } from '../../graphql/resolvers/queries/journalReport';
import { getReportBase } from './definitions';
import {
  getLineRecords,
  getReportDetailRecords,
  recordListWithValues,
} from './maps';

export interface IGroupRule {
  group: string;
  code: string;
  name?: string;
  excMore?: boolean;
  from?: string[];
  excTotal?: number[];
  style?: string;
  groupRule?: IGroupRule | null;
}

export interface IGroupCommon {
  group: string;
  code: string;
  name?: string;
}

export const getRecords = async (
  subdomain: string,
  models: IModels,
  report: string,
  groupRules: IGroupCommon[],
  filterParams: IReportFilterParams,
  user: IUserDocument,
) => {
  const reportBase = getReportBase(report);
  if (!reportBase) throw new Error(`Unsupported journal: ${report}`);

  return reportBase.recordMode === 'line'
    ? getLineRecords(subdomain, models, filterParams, user, reportBase)
    : recordListWithValues(
        subdomain,
        models,
        groupRules,
        filterParams,
        user,
        reportBase,
      );
};

export const getRecMore = async (
  subdomain: string,
  models: IModels,
  report: string,
  filterParams: IReportFilterParams,
  user: IUserDocument,
) => {
  const reportBase = getReportBase(report);
  if (!reportBase) throw new Error(`Unsupported journal: ${report}`);

  if (!reportBase.supportsMore) {
    return [];
  }

  return getReportDetailRecords(
    subdomain,
    models,
    filterParams,
    user,
    reportBase,
  );
};

export const getGroupRule = (
  firstGroupRule: IGroupCommon[],
  groupRule?: IGroupRule,
) => {
  const subGroupRule = groupRule?.groupRule;

  if (groupRule?.group && !groupRule.excMore) {
    const froms = (groupRule.from && `${groupRule.from}.`) || '';

    firstGroupRule.push({
      group: `${froms}${groupRule.group}`,
      code: groupRule.code,
      name: groupRule.name,
    });
  }

  if (subGroupRule) {
    getGroupRule(firstGroupRule, subGroupRule);
  }
  return firstGroupRule;
};

export const getFirstGroupRule = getGroupRule;
