import { Worker } from "bullmq";
import redis from "@erxes/api-utils/src/redis";
import { generateModels } from "../connectionResolver";
import { getLastTransaction } from "../utils";
import * as moment from "moment";
import { getConfig } from "../messageBroker";

export const initWorker = () => {
  const worker = new Worker(
    "periodLock", // Queue name
    async (job) => {
      const { subdomain, date } = job.data;

      console.log(`Processing job for subdomain: ${subdomain}, date: ${date}`);

      const models = await generateModels(subdomain);
      const contractTypes = await models.ContractTypes.find();

      for (const type of contractTypes) {
        const contracts = await models.Contracts.find({
          contractTypeId: type._id
        });

        const coreConfig = await getConfig("loansConfig", subdomain, {});

        const config = {
          normalExpirationDay:
            type.config?.normalExpirationDay ??
            coreConfig.normalExpirationDay ??
            0,
          expiredExpirationDay:
            type.config?.expiredExpirationDay ??
            coreConfig.expiredExpirationDay ??
            30,
          doubtExpirationDay:
            type.config?.doubtExpirationDay ??
            coreConfig.doubtExpirationDay ??
            60,
          negativeExpirationDay:
            type.config?.negativeExpirationDay ??
            coreConfig.negativeExpirationDay ??
            180,
          badExpirationDay:
            type.config?.badExpirationDay ?? coreConfig.badExpirationDay ?? 360
        };

        for (const contract of contracts) {
          let lastTransaction;
          const transactions = await models.Transactions.find({
            contractId: contract._id
          });

          if (Array.isArray(transactions) && transactions.length > 0) {
            lastTransaction = await getLastTransaction(transactions);

            let classification = "active";

            if (lastTransaction?.payDate) {
              const today = moment();
              const lastDate = moment(lastTransaction.payDate);
              const diffInDays = today.diff(lastDate, "days");

              if (diffInDays >= config.badExpirationDay) {
                classification = "bad";
              } else if (diffInDays >= config.negativeExpirationDay) {
                classification = "suspicious";
              } else if (diffInDays >= config.doubtExpirationDay) {
                classification = "abnormal";
              } else if (diffInDays >= config.expiredExpirationDay) {
                classification = "expired";
              } else {
                classification = "normal";
              }
            }

            const schedules = await models.Schedules.find({
              contractId: contract._id
            });

            const maxTimestamp = Math.max(
              ...schedules.map((d) => new Date(d.payDate).getTime())
            );

            const latestSchedules = schedules.filter(
              (d) => new Date(d.payDate).getTime() === maxTimestamp
            );

            console.log("Last payDate:", latestSchedules);

            // await models.Contracts.updateOne(
            //   { _id: contract._id },
            //   { $set: { classification } }
            // );

            console.log({
              contractId: contract.number,
              classification,
              ha: lastTransaction.payDate,
              daysSinceLastPayment: lastTransaction?.payDate
                ? moment().diff(moment(lastTransaction.payDate), "days")
                : null
            });
          }
        }
      }

      // Wait 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("done"); // <- This will print after 10 seconds

      return { status: "done" }; // Optionally return something
    },
    {
      connection: redis as any
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  return worker;
};
