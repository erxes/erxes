import { consumeRPCQueue } from "../messageBroker";

export const reportsCunsomers = ({ name, reports }) => {
  if (reports.getChartResult) {
    consumeRPCQueue(`${name}:reports.getChartResult`, async args => ({
      status: "success",
      data: await reports.getChartResult(args)
    }));
  }
};
