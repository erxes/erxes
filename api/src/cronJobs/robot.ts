import * as schedule from 'node-schedule';
import { Users } from '../db/models';
import { OnboardingHistories } from '../db/models/Robot';
import { debugCrons } from '../debuggers';
import messageBroker from '../messageBroker';

const checkOnboarding = async () => {
  const users = await Users.find({}).lean();

  for (const user of users) {
    const status = await OnboardingHistories.userStatus(user._id);

    if (status === 'completed') {
      continue;
    }

    messageBroker().sendMessage('callPublish', {
      name: 'onboardingChanged',
      data: {
        onboardingChanged: {
          userId: user._id,
          type: status,
        },
      },
    });
  }
};

/**
 * *    *    *    *    *    *
 * ┬    ┬    ┬    ┬    ┬    ┬
 * │    │    │    │    │    |
 * │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 * │    │    │    │    └───── month (1 - 12)
 * │    │    │    └────────── day of month (1 - 31)
 * │    │    └─────────────── hour (0 - 23)
 * │    └──────────────────── minute (0 - 59)
 * └───────────────────────── second (0 - 59, OPTIONAL)
 */
schedule.scheduleJob('0 45 23 * * *', () => {
  debugCrons('Checked onboarding');

  checkOnboarding();
});
