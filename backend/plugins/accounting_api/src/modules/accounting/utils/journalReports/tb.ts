import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IGroupCommon } from '.';
import { IReportFilterParams } from '../../graphql/resolvers/queries/journalReport';
import { buildJournalReportRecords } from './maps';

export const handleMainTB = async (
  subdomain: string,
  models: IModels,
  groupRules: IGroupCommon[],
  filterParams: IReportFilterParams,
  user: IUserDocument,
) => {
  return {
    records: await buildJournalReportRecords(
      subdomain,
      models,
      groupRules,
      filterParams,
      user,
      { baseGroups: ['accountId'] },
    ),
  };
};
