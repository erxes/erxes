export const cronConsumers = (params: any) => {
  const {
    name,
    consumeQueue,
    handleMinutelyJob,
    handleHourlyJob,
    handleDailyJob
  } = params;

  if (handleMinutelyJob) {
    consumeQueue(`${name}:handleMinutelyJob`, async ({ subdomain }) => {
      await handleMinutelyJob(subdomain);
    });
  }

  if (handleHourlyJob) {
    consumeQueue(`${name}:handleHourlyJob`, async ({ subdomain }) => {
      await handleHourlyJob(subdomain);
    });
  }
  if (handleDailyJob) {
    consumeQueue(`${name}:handleDailyJob`, async ({ subdomain }) => {
      await handleDailyJob(subdomain);
    });
  }
};
