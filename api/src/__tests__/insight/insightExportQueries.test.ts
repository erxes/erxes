import {
  generateActivityReport,
  generateTagReport
} from '../../data/modules/insights/exportData';
import {
  insightActivityReportExport,
  insightFirstResponseReportExport,
  insightTagReportExport,
  insightVolumeReportExport
} from '../../data/modules/insights/insightExports';
import { afterEachTest, beforeEachTest, endDate, startDate } from './utils';

import '../setup.ts';

describe('insightExportQueries', () => {
  let user;
  let args;

  beforeEach(async () => {
    const response = await beforeEachTest();

    args = response.args;
    user = response.user;
  });

  afterEach(async () => {
    // Clearing test data
    await afterEachTest();
  });

  test(`test if Error('Permission denied') exception is working as intended`, async () => {
    expect.assertions(4);

    const expectError = async func => {
      try {
        await func({}, {});
      } catch (e) {
        expect(e.message).toBe('Permission denied');
      }
    };

    expectError(insightVolumeReportExport);
    expectError(insightActivityReportExport);
    expectError(insightFirstResponseReportExport);
    expectError(insightTagReportExport);
  });

  test('insightActivityReportExport', async () => {
    const { data } = await generateActivityReport(args, user);

    expect(data[0].userId).toBe(user._id);

    // response messages
    expect(data[0].count).toBe(4);

    const { name } = await insightActivityReportExport(args, user);

    expect(name).toBe(`Operator Activity report - ${startDate} - ${endDate}`);
  });

  test('insightTagReportExport', async () => {
    const { data } = await generateTagReport(args, user);

    expect(data[0].count).toBe(2);

    const { name } = await insightTagReportExport(args, user);

    expect(name).toBe(`Tag report - ${startDate} - ${endDate}`);
  });
});
