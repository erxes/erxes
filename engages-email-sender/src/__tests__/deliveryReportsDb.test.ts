import { DeliveryReports, Stats } from '../models';
import { prepareAvgStats } from '../utils';
import { statsFactory } from './factories';
import './setup';

test('Stats: updateStats', async done => {
  const statsObj = await statsFactory({ engageMessageId: 'engageMessageId' });
  await Stats.updateStats('engageMessageId', 'bounce');

  const stats = await Stats.findOne({ engageMessageId: 'engageMessageId' });

  expect(stats.bounce).toBe(statsObj.bounce + 1);

  done();
});

test('DeliveryReports: updateOrCreateReport', async done => {
  const headers = {
    engageMessageId: '123',
    mailId: 'mailid123',
    customerId: 'customer'
  };

  const deliveryReport = await DeliveryReports.updateOrCreateReport(
    headers,
    'open'
  );

  expect(deliveryReport).toBeDefined();
  expect(deliveryReport).toBeTruthy();

  const result = await DeliveryReports.updateOrCreateReport(
    headers,
    'complaint'
  );

  expect(result).toBe('reject');

  const deliveryReportObj = await DeliveryReports.findOne({
    customerId: 'customer'
  });

  expect(deliveryReportObj.status).toBe('complaint');

  done();
});

test('Stats: Test average bounce & complaint percent', async done => {
  const s1 = await statsFactory({});
  const s2 = await statsFactory({});
  const averageStat = await prepareAvgStats();

  const bounce1 = (s1.bounce * 100) / s1.total;
  const bounce2 = (s2.bounce * 100) / s2.total;
  const complaint1 = (s1.complaint * 100) / s1.total;
  const complaint2 = (s2.complaint * 100) / s2.total;

  expect(averageStat[0].avgBouncePercent).toBe((bounce1 + bounce2) / 2);
  expect(averageStat[0].avgComplaintPercent).toBe(
    (complaint1 + complaint2) / 2
  );

  done();
});
