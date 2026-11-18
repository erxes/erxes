import { Model } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { generateTunableReport } from '../../utils/tunableReports';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  IReportDocument,
  IReportDefinition,
  reportInputSchema,
  reportGenerateInputSchema,
  IReportGenerateParams,
  IReportGenerated,
} from '../../@types/report';
import { reportSchema } from '../definitions/report';
import { validateReportDefinitions } from '../../utils/reportValidation';

export interface IReportListParams {
  searchValue?: string;
  page?: number;
  perPage?: number;
}
export interface IReportModel extends Model<IReportDocument> {
  listReports(
    params: IReportListParams,
  ): Promise<{ list: IReportDocument[]; totalCount: number }>;
  getReport(_id: string): Promise<IReportDocument>;
  generateReport(
    params: IReportGenerateParams,
    user: IUserDocument,
  ): Promise<IReportGenerated>;
  saveReport(
    input: unknown,
    userId: string,
    _id?: string,
    expectedVersion?: number,
  ): Promise<IReportDocument>;
  removeReport(_id: string, expectedVersion: number): Promise<boolean>;
}
export const loadReportClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class Report {
    static async listReports({
      searchValue,
      page = 1,
      perPage = 20,
    }: IReportListParams) {
      const filter = searchValue?.trim()
        ? {
            $or: [
              { name: new RegExp(escapeRegExp(searchValue.trim()), 'i') },
              { code: new RegExp(escapeRegExp(searchValue.trim()), 'i') },
            ],
          }
        : {};
      const limit = Math.min(Math.max(Math.floor(perPage), 1), 100);
      const [list, totalCount] = await Promise.all([
        models.Reports.find(filter)
          .sort({ code: 1, _id: 1 })
          .skip((Math.max(1, Math.floor(page)) - 1) * limit)
          .limit(limit),
        models.Reports.countDocuments(filter),
      ]);
      return { list, totalCount };
    }
    static async getReport(_id: string) {
      const report = await models.Reports.findOne({ _id });
      if (!report) throw new Error('Report not found');
      return report;
    }
    static async generateReport(
      params: IReportGenerateParams,
      user: IUserDocument,
    ): Promise<IReportGenerated> {
      const { _id, ...settings } = reportGenerateInputSchema.parse(params);
      const report = await models.Reports.getReport(_id);
      const cells = await generateTunableReport(models, report, settings, user);
      return { report, ...settings, cells };
    }
    static async saveReport(
      input: unknown,
      userId: string,
      _id?: string,
      expectedVersion?: number,
    ) {
      const parsed = reportInputSchema.parse(input);
      const previous = _id ? await models.Reports.getReport(_id) : undefined;
      if (previous && previous.version !== expectedVersion)
        throw new Error('Report changed. Reload before saving.');
      const duplicate = await models.Reports.findOne({
        code: parsed.code,
        ...(_id ? { _id: { $ne: _id } } : {}),
      });
      if (duplicate) throw new Error('Report code must be unique');
      const candidate = new models.Reports({
        ...parsed,
        _id: previous?._id,
        version: (previous?.version || 0) + 1,
      });
      await candidate.validate();
      const reports = await models.Reports.find(
        _id ? { _id: { $ne: _id } } : {},
      ).lean<IReportDefinition[]>();
      validateReportDefinitions([
        ...reports,
        { ...parsed, _id: candidate._id, version: candidate.version },
      ]);
      // Resolve account references only through this tenant's accounting models.
      const accountIds = new Set<string>();
      const categoryIds = new Set<string>();
      for (const section of parsed.sections)
        for (const formula of section.formulas) {
          for (const value of [formula.debitAccountId, formula.creditAccountId])
            if (value) accountIds.add(value);
          for (const value of [
            formula.debitAccountCategoryId,
            formula.creditAccountCategoryId,
          ])
            if (value) categoryIds.add(value);
        }
      const [accounts, categories] = await Promise.all([
        accountIds.size
          ? models.Accounts.find(
              { _id: { $in: [...accountIds] } },
              { _id: 1 },
            ).lean<{ _id: string }[]>()
          : [],
        categoryIds.size
          ? models.AccountCategories.find(
              { _id: { $in: [...categoryIds] } },
              { _id: 1 },
            ).lean<{ _id: string }[]>()
          : [],
      ]);
      if (accounts.length !== accountIds.size)
        throw new Error('Account not found');
      if (categories.length !== categoryIds.size)
        throw new Error('Account category not found');
      const now = new Date();
      const report = previous
        ? await models.Reports.findOneAndUpdate(
            { _id, version: expectedVersion },
            {
              $set: { ...parsed, modifiedAt: now, modifiedBy: userId },
              $inc: { version: 1 },
            },
            { new: true, runValidators: true },
          )
        : await models.Reports.create({
            ...parsed,
            _id: candidate._id,
            createdBy: userId,
            modifiedBy: userId,
            createdAt: now,
            modifiedAt: now,
            version: 1,
          });
      if (!report) throw new Error('Report changed. Reload before saving.');
      sendDbEventLog({
        action: previous ? 'update' : 'create',
        docId: report._id,
        currentDocument: report.toObject(),
        ...(previous ? { prevDocument: previous.toObject() } : {}),
      });
      return report;
    }
    static async removeReport(_id: string, expectedVersion: number) {
      const remaining = await models.Reports.find({ _id: { $ne: _id } }).lean<
        IReportDefinition[]
      >();
      validateReportDefinitions(remaining);
      const report = await models.Reports.findOneAndDelete({
        _id,
        version: expectedVersion,
      });
      if (!report)
        throw new Error(
          'Report changed or was removed. Reload before deleting.',
        );
      sendDbEventLog({
        action: 'delete',
        docId: report._id,
        prevDocument: report.toObject(),
      });
      return true;
    }
  }
  reportSchema.loadClass(Report);
  return reportSchema;
};
