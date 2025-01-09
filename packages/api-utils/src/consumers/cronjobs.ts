import { consumeQueue } from "../messageBroker";

export const cronjobCunsomers = ({ name, cronjobs }) => {
  if (cronjobs.handle3SecondlyJob) {
    cronjobs.handle3SecondlyJobAvailable = true;

    consumeQueue(`${name}:handle3SecondlyJob`, async args => ({
      status: "success",
      data: await cronjobs.handle3SecondlyJob(args)
    }));
  }

  if (cronjobs.handleMinutelyJob) {
    cronjobs.handleMinutelyJobAvailable = true;

    consumeQueue(`${name}:handleMinutelyJob`, async args => ({
      status: "success",
      data: await cronjobs.handleMinutelyJob(args)
    }));
  }

  if (cronjobs.handle10MinutelyJob) {
    cronjobs.handle10MinutelyJobAvailable = true;

    consumeQueue(`${name}:handle10MinutelyJob`, async args => ({
      status: "success",
      data: await cronjobs.handle10MinutelyJob(args)
    }));
  }

  if (cronjobs.handleHourlyJob) {
    cronjobs.handleHourlyJobAvailable = true;

    consumeQueue(`${name}:handleHourlyJob`, async args => ({
      status: "success",
      data: await cronjobs.handleHourlyJob(args)
    }));
  }

  if (cronjobs.handleDailyJob) {
    cronjobs.handleDailyJobAvailable = true;

    consumeQueue(`${name}:handleDailyJob`, async args => ({
      status: "success",
      data: await cronjobs.handleDailyJob(args)
    }));
  }
};
