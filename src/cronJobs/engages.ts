import { EngageMessages } from '../db/models';
import { createSchedule } from '../trackers/engageScheduleTracker';

const initCronJob = async () => {
  const messages = await EngageMessages.find({
    kind: { $in: ['auto', 'visitorAuto'] },
    isLive: true,
  });

  for (const message of messages) {
    createSchedule(message);
  }
};

initCronJob();
