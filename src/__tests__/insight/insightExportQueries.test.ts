import * as moment from 'moment';
import {
  generateActivityReport,
  generateFirstResponseReport,
  generateTagReport,
  generateVolumeReport,
} from '../../data/resolvers/queries/insights/exportData';
import insightExportQueries from '../../data/resolvers/queries/insights/insightExport';
import { graphqlRequest } from '../../db/connection';
import { afterEachTest, beforeEachTest, endDate, paramsDef, paramsValue, startDate } from './insightQueries.test';

describe('insightExportQueries', () => {
  let user;
  let secondUser;
  let args;

  const DOMAIN = process.env.DOMAIN || '';

  beforeEach(async () => {
    const response = await beforeEachTest();

    args = response.args;
    user = response.user;
    secondUser = response.secondUser;
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

  test('insightVolumeReportExport', async () => {
    const qry = `
      query insightVolumeReportExport($type: String, ${paramsDef}) {
        insightVolumeReportExport(type: $type, ${paramsValue})
      }
    `;

    const { data } = await generateVolumeReport(args, user);

    expect(data[7].count).toBe(8);
    // request messages
    expect(data[7].messageCount).toBe(6);

    const response = await graphqlRequest(qry, 'insightVolumeReportExport', args);
    expect(response).toBe(`${DOMAIN}/static/xlsTemplateOutputs/Volume report By date - ${startDate} - ${endDate}.xlsx`);
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
    expect(data[0].count).toBe(6);

    const response = await graphqlRequest(qry, 'insightActivityReportExport', args);
    expect(response).toBe(
      `${DOMAIN}/static/xlsTemplateOutputs/Operator Activity report - ${startDate} - ${endDate}.xlsx`,
    );
  });

  test('insightFirstResponseReportExport', async () => {
    const qry = `
      query insightFirstResponseReportExport(${paramsDef}) {
        insightFirstResponseReportExport(${paramsValue})
      }
    `;

    const usersDatas = await generateFirstResponseReport({ args, user });

    expect(usersDatas.length).toBe(1);
    expect(usersDatas[0].title).toBe(moment().format('YYYY-MM-DD'));
    expect(usersDatas[0].intervals.find(d => d.name === '0-5 second').count).toBe(1);
    expect(usersDatas[0].intervals.find(d => d.name === '56-60 second').count).toBe(1);
    expect(usersDatas[0].intervals.find(d => d.name === '1-2 min').count).toBe(1);
    expect(usersDatas[0].intervals.find(d => d.name === '5+ min').count).toBe(1);

    const operatorDatas = await generateFirstResponseReport({ args, user, type: 'operator' });

    expect(operatorDatas.length).toBe(2);

    const first = operatorDatas.find(o => o._id === user._id);
    const second = operatorDatas.find(o => o._id === secondUser._id);

    expect(first.title).toBe(user.details.fullName);
    expect(first.intervals.find(d => d.name === '1-2 min').count).toBe(1);
    expect(first.intervals.find(d => d.name === '5+ min').count).toBe(1);

    expect(second.title).toBe(secondUser.details.fullName);
    expect(second.intervals.find(d => d.name === '0-5 second').count).toBe(1);
    expect(second.intervals.find(d => d.name === '56-60 second').count).toBe(1);

    const userDatas = await generateFirstResponseReport({ args, user, userId: user._id });

    expect(userDatas.length).toBe(1);
    expect(userDatas[0].title).toBe(moment().format('YYYY-MM-DD'));
    expect(userDatas[0].intervals.find(d => d.name === '1-2 min').count).toBe(1);
    expect(userDatas[0].intervals.find(d => d.name === '5+ min').count).toBe(1);

    const response = await graphqlRequest(qry, 'insightFirstResponseReportExport', args);
    expect(response).toBe(`${DOMAIN}/static/xlsTemplateOutputs/First Response - ${startDate} - ${endDate}.xlsx`);
  });

  test('insightTagReportExport', async () => {
    const qry = `
      query insightTagReportExport(${paramsDef}) {
        insightTagReportExport(${paramsValue})
      }
    `;

    const { data } = await generateTagReport(args, user);

    expect(data[0].count).toBe(4);

    const response = await graphqlRequest(qry, 'insightTagReportExport', args);
    expect(response).toBe(`${DOMAIN}/static/xlsTemplateOutputs/Tag report - ${startDate} - ${endDate}.xlsx`);
  });
});
