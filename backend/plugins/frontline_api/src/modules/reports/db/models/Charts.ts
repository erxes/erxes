import { Model } from 'mongoose';
import {
  IReportChart,
  IReportChartDocument,
} from '@/reports/@types/chart';
import { reportChartSchema } from '@/reports/db/definitions/chart';
import { IModels } from '~/connectionResolvers';

export interface IReportChartModel extends Model<IReportChartDocument> {
  getReportChart(_id: string): Promise<IReportChartDocument>;
  createReportChart(
    doc: IReportChart,
    userId: string,
  ): Promise<IReportChartDocument>;
  updateReportChart(
    _id: string,
    doc: Partial<IReportChart>,
  ): Promise<IReportChartDocument>;
  removeReportChart(_id: string): Promise<IReportChartDocument>;
}

const validateName = (name: string) => {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error('Chart name is required');
  }

  return trimmed;
};

export const loadReportChartClass = (models: IModels) => {
  class ReportChart {
    public static async getReportChart(_id: string) {
      const chart = await models.ReportCharts.findOne({ _id });

      if (!chart) {
        throw new Error('Report chart not found');
      }

      return chart;
    }

    public static async createReportChart(doc: IReportChart, userId: string) {
      if (!doc.chartType) {
        throw new Error('Chart type is required');
      }

      return models.ReportCharts.create({
        ...doc,
        name: validateName(doc.name || ''),
        createdBy: userId,
      });
    }

    public static async updateReportChart(
      _id: string,
      doc: Partial<IReportChart>,
    ) {
      await models.ReportCharts.getReportChart(_id);

      const modifier: Partial<IReportChart> = {};

      if (doc.name !== undefined) {
        modifier.name = validateName(doc.name);
      }

      if (doc.visualType !== undefined) {
        modifier.visualType = doc.visualType;
      }

      if (doc.colSpan !== undefined) {
        modifier.colSpan = doc.colSpan;
      }

      if (doc.filters !== undefined) {
        modifier.filters = doc.filters;
      }

      await models.ReportCharts.updateOne({ _id }, { $set: modifier });

      return models.ReportCharts.getReportChart(_id);
    }

    public static async removeReportChart(_id: string) {
      const chart = await models.ReportCharts.findOneAndDelete({ _id });

      if (!chart) {
        throw new Error('Report chart not found');
      }

      return chart;
    }
  }

  reportChartSchema.loadClass(ReportChart);

  return reportChartSchema;
};
