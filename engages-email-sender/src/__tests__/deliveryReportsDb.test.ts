import { DeliveryReports, Stats } from '../models';
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
    customerId: 'customer',
  };

  const deliveryReport = await DeliveryReports.updateOrCreateReport(headers, 'open');

  expect(deliveryReport).toBeDefined();
  expect(deliveryReport).toBeTruthy();

  const result = await DeliveryReports.updateOrCreateReport(headers, 'complaint');

  expect(result).toBe('reject');

  const deliveryReportObj = await DeliveryReports.findOne({ customerId: 'customer' });

  expect(deliveryReportObj.status).toBe('complaint');

  done();
});
