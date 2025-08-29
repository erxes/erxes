import { Worker } from "bullmq";
import redis from "@erxes/api-utils/src/redis";

export const initWorker = () => {
  const worker = new Worker(
    "periodLock", // Queue name
    async job => {
      const { subdomain, date } = job.data;

      console.log(`Processing job for subdomain: ${subdomain}, date: ${date}`);

      // Wait 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));

      console.log("done"); // <- This will print after 10 seconds

      return { status: "done" }; // Optionally return something
    },
    {
      connection: redis as any
    }
  );

  worker.on("completed", job => {
    console.log(`Job ${job.id} completed`);
  });

  return worker;
};
