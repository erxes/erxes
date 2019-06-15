import { generateActivityReport, generateTagReport } from '../../data/resolvers/queries/insights/exportData';
import insightExportQueries from '../../data/resolvers/queries/insights/insightExport';
import { graphqlRequest } from '../../db/connection';
import { afterEachTest, beforeEachTest, endDate, paramsDef, paramsValue, startDate } from './utils';

import '../setup.ts';

describe('insightExportQueries', () => {
  let user;
  let args;

  const DOMAIN = process.env.DOMAIN || '';

  beforeEach(async () => {
    const response = await beforeEachTest();

    args = response.args;
    user = response.user;
  });

  afterEach(async () => {
    // Clearing test data
    await afterEachTest();
  });

  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(4);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(insightExportQueries.insightVolumeReportExport);
    expectError(insightExportQueries.insightActivityReportExport);
    expectError(insightExportQueries.insightFirstResponseReportExport);
    expectError(insightExportQueries.insightTagReportExport);
  });

  test('insightActivityReportExport', async () => {
    const qry = `
      query insightActivityReportExport(${paramsDef}) {
        insightActivityReportExport(${paramsValue})
      }
    `;

    const { data } = await generateActivityReport(args, user);

    expect(data[0].userId).toBe(user._id);

    // response messages
    expect(data[0].count).toBe(4);

    const response = await graphqlRequest(qry, 'insightActivityReportExport', args);
    expect(response).toBe(
      `${DOMAIN}/static/xlsTemplateOutputs/Operator Activity report - ${startDate} - ${endDate}.xlsx`,
    );
  });

  test('insightTagReportExport', async () => {
    const qry = `
      query insightTagReportExport(${paramsDef}) {
        insightTagReportExport(${paramsValue})
      }
    `;

    const { data } = await generateTagReport(args, user);

    expect(data[0].count).toBe(2);

    const response = await graphqlRequest(qry, 'insightTagReportExport', args);
    expect(response).toBe(`${DOMAIN}/static/xlsTemplateOutputs/Tag report - ${startDate} - ${endDate}.xlsx`);
  });
});
