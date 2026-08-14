import { IUserDocument } from "erxes-api-shared/core-types";
import { IModels } from "~/connectionResolvers";
import { IReportFilterParams } from "../../graphql/resolvers/queries/journalReport";
import { handleMainACMore } from './details/main';
import { getReportBase } from './definitions';
import {
  getLineRecords,
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

type ReportRecord = Record<string, unknown>;

export const getRecords = async (subdomain: string, models: IModels, report: string, groupRules: IGroupCommon[], filterParams: IReportFilterParams, user: IUserDocument) => {
  const reportBase = getReportBase(report);
  if (!reportBase) throw new Error(`Unsupported journal: ${report}`);

  return reportBase.recordMode === 'line'
    ? getLineRecords(
        subdomain,
        models,
        filterParams,
        user,
        reportBase,
      )
    : recordListWithValues(
        subdomain,
        models,
        groupRules,
        filterParams,
        user,
        reportBase,
      );
};

export const getRecMore = async (subdomain: string, models: IModels, report: string, filterParams: IReportFilterParams, user: IUserDocument) => {
  const handler = getReportMoreHandler(report);
  if (!handler) throw new Error(`Unsupported journal: ${report}`);

  const { trDetails } = await handler(subdomain, models, filterParams, user);

  return trDetails;
}

const getReportMoreHandler = (report: string) => {
  const handlers: Record<
    string,
    (
      subdomain: string,
      models: IModels,
      filterParams: IReportFilterParams,
      user: IUserDocument
    ) => Promise<{ trDetails: ReportRecord[] }>
  > = {
    ac: handleMainACMore,
    tb: async () => ({ trDetails: [] }),
  };

  return handlers[report];
};

export const getGroupRule = (firstGroupRule: IGroupCommon[], groupRule?: IGroupRule) => {
  const subGroupRule = groupRule?.groupRule;

  if (groupRule?.group && !groupRule.excMore) {
    const froms = groupRule.from && `${groupRule.from}.` || '';

    firstGroupRule.push(
      {
        group: `${froms}${groupRule.group}`,
        code: groupRule.code,
        name: groupRule.name
      }
    )
  }

  if (subGroupRule) {
    getGroupRule(firstGroupRule, subGroupRule);
  }
  return firstGroupRule;
}

export const getFirstGroupRule = getGroupRule;
