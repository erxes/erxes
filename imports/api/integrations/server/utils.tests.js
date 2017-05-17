/* eslint-env mocha */

import { assert } from 'meteor/practicalmeteor:chai';
import { checkAvailability } from '../utils';

describe('integrations: utils', function() {
  describe('check availability', function() {
    it('manual', function() {
      // online
      const integration = {
        availabilityMethod: 'manual',
        isOnline: true,
      };

      assert.equal(checkAvailability(integration), true);

      // offline
      integration.isOnline = false;

      assert.equal(checkAvailability(integration), false);
    });

    it('auto', function() {
      // regular day ================
      // offline: no config found
      const integration = {
        availabilityMethod: 'auto',
        onlineHours: [
          {
            day: 'tuesday',
            from: '09:00 AM',
            to: '05:00 PM',
          },
        ],
      };

      // 2017-05-08, monday
      let date = new Date(Date.parse('2017/05/08 11:10 AM'));

      assert.equal(checkAvailability(integration, date), false);

      // offline: config found but not in range
      // 2017-05-09, tuesday
      date = new Date(Date.parse('2017/05/09 06:10 PM'));

      assert.equal(checkAvailability(integration, date), false);

      // online
      date = new Date(Date.parse('2017/05/09 09:01 AM'));

      assert.equal(checkAvailability(integration, date), true);

      // everyday ===================
      integration.onlineHours = [
        {
          day: 'everyday',
          from: '09:00 AM',
          to: '05:00 PM',
        },
      ];

      // online
      // tuesday
      date = new Date(Date.parse('2017/05/09 10:10 AM'));
      assert.equal(checkAvailability(integration, date), true);

      // offline
      // tuesday
      date = new Date(Date.parse('2017/05/09 60:10 PM'));
      assert.equal(checkAvailability(integration, date), false);

      // weekdays ===================
      integration.onlineHours = [
        {
          day: 'weekdays',
          from: '09:00 AM',
          to: '05:00 PM',
        },
      ];

      // online
      // tuesday
      date = new Date(Date.parse('2017/05/09 10:10 AM'));
      assert.equal(checkAvailability(integration, date), true);

      // offline
      // sunday
      date = new Date(Date.parse('2017/05/13 10:10 AM'));
      assert.equal(checkAvailability(integration, date), false);

      // weekends ===================
      integration.onlineHours = [
        {
          day: 'weekends',
          from: '09:00 AM',
          to: '05:00 PM',
        },
      ];

      // online
      // saturday
      date = new Date(Date.parse('2017/05/13 10:10 AM'));
      assert.equal(checkAvailability(integration, date), true);

      // offline
      // tuesday
      date = new Date(Date.parse('2017/05/09 10:10 AM'));
      assert.equal(checkAvailability(integration, date), false);
    });
  });
});
