import { IUserDocument } from "erxes-api-shared/core-types";
import { IModels } from "~/connectionResolvers";
import { IReportFilterParams } from "../../graphql/resolvers/queries/journalReport";
import { handleMainTB } from "./tb";
import { handleMainAC, handleMainACMore } from "./ac";
import { handleInvCost } from "./invCost";

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
  const handler = getReportHandler(report);
  if (!handler) throw new Error(`Unsupported journal: ${report}`);

  const { records } = await handler(subdomain, models, groupRules, filterParams, user);

  return records;
}

const getReportHandler = (report: string) => {
  const handlers: Record<
    string,
    (
      subdomain: string,
      models: IModels,
      groupRules: IGroupCommon[],
      filterParams: IReportFilterParams,
      user: IUserDocument
    ) => Promise<{ records: ReportRecord[] }>
  > = {
    ac: handleMainAC,
    tb: handleMainTB,
    invCost: handleInvCost,
  };

  return handlers[report];
}

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

export const getFirstGroupRule = (firstGroupRule: IGroupCommon[], groupRule?: IGroupRule) => {
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
    getFirstGroupRule(firstGroupRule, subGroupRule);
  }
  return firstGroupRule;
}
