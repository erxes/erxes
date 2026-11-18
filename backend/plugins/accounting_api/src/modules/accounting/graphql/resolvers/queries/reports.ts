import { IContext } from '~/connectionResolvers';
import { IReportGenerateParams } from '../../../@types/report';
import { IReportListParams } from '../../../db/models/Reports';
import { validateRequiredId } from '../../validateRequired';

export const reportQueries = {
  async accountingTunableReports(
    _root: unknown,
    params: IReportListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readTunableReports');
    return models.Reports.listReports(params);
  },
  async accountingTunableReportGenerate(
    _root: unknown,
    params: IReportGenerateParams,
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('readTunableReports');
    await checkPermission('accountsRead');
    return models.Reports.generateReport(params, user);
  },
  async accountingTunableReportDetail(
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readTunableReports');
    validateRequiredId(_id);
    return models.Reports.getReport(_id);
  },
};
