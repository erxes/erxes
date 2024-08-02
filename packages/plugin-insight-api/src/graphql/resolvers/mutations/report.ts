import { getService } from '@erxes/api-utils/src/serviceDiscovery';
import { IContext } from '../../../connectionResolver';
import {
    IReport,
    IReportDocument,
} from '../../../models/definitions/insight';

const reportsMutations = {
    async reportAdd(_root, doc: IReport, { models, user }: IContext) {
        const report = await models.Reports.createReport({
            ...doc,
            createdBy: user._id,
            createdAt: new Date(),
            updatedBy: user._id,
            updatedAt: new Date(),
        });

        if (doc.serviceType) {
            if (!doc.serviceName) {
                throw new Error(`doc.serviceName is ${doc.serviceName}`);
            }
            const service = await getService(doc.serviceName);

            const reportTemplate =
                service.config?.meta?.reports?.reportTemplates?.find(
                    (t) => t.serviceType === doc.serviceType,
                );

            const chartTemplates = service.config?.meta?.reports?.chartTemplates;

            const { charts } = doc;
            const { serviceName } = reportTemplate;
            let getChartTemplates;

            if (charts) {
                getChartTemplates = chartTemplates?.filter((t) =>
                    charts.includes(t.templateType),
                );
            } else {
                // create with default charts
                getChartTemplates = chartTemplates?.filter((t) =>
                    reportTemplate.charts.includes(t.templateType),
                );
            }

            if (getChartTemplates) {
                await models.Charts.insertMany(
                    getChartTemplates.map((c) => {
                        return {
                            serviceName,
                            chartType: c.chartTypes[0],
                            contentId: report._id,
                            contentType: 'insight:report',
                            ...c,
                        };
                    }),
                );
            }
        }

        return report;
    },
    async reportEdit(
        _root,
        { _id, ...doc }: IReportDocument,
        { models, user }: IContext,
    ) {
        if (doc.charts) {
            const { charts } = doc;

            for (const chart of charts) {
                await models.Charts.updateChart(chart._id, { ...chart });
            }
        }

        return models.Reports.updateReport(_id, {
            ...doc,
            updatedAt: new Date(),
            updatedBy: user._id,
        });
    },
    async reportRemove(_root, _id: string, { models }: IContext) {
        await models.Charts.deleteMany({ contentId: _id });
        return models.Reports.removeReport(_id);
    },
    async reportRemoveMany(_root, { ids }, { models }: IContext) {
        await models.Charts.deleteMany({ contentId: { $in: ids } });
        const reports = await models.Reports.find({ _id: { $in: ids } });
        await models.Reports.deleteMany({ _id: { $in: ids } });
        return reports;
    },

    async reportDuplicate(_root, _id: string, { models, user }: IContext) {
        const report = await models.Reports.findById(_id);
        if (!report) {
            throw new Error('Report not found');
        }

        const {_id: _, ...dup} = report.toObject();

        const duplicatedReport = await models.Reports.createReport({
            ...dup,
            name: `${report.name} copied`,
            createdBy: user._id,
            createdAt: new Date(),
            updatedBy: user._id,
            updatedAt: new Date(),
        });

        const charts = await models.Charts.find({ contentId: _id });
        const duplicatedCharts = charts.map((existingChart) => ({
            ...existingChart.toObject(),
            _id: undefined,
            contentId: duplicatedReport._id,
        }));
        await models.Charts.insertMany(duplicatedCharts);

        return duplicatedReport;
    }
};

export default reportsMutations;
