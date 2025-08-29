import { fetchPolaris, updateContract } from "../utils";
import { updateSchedule } from "./updateSchedule";

const getMethod = (contract) => {
  if (contract.stepRules?.length) {
    return "4";
  }

  switch (contract.repayment) {
    case "equal":
      return "3";
    case "fixed":
      return "1";

    default:
      break;
  }
};

const getHolidayMethod = (method) => {
  switch (method) {
    case "before":
      return "1";
    case "after":
      return "3";

    default:
      return "2";
  }
};

export const createLoanSchedule = async (
  subdomain: string,
  polarisConfig,
  contract
) => {
  if (contract.isSyncedSchedules) {
    await updateSchedule(subdomain, polarisConfig, contract);
  }

  const sendData = [
    contract.number,
    contract.startDate,
    contract.leaseAmount,
    getMethod(contract),
    "M",
    null,
    contract.scheduleDays?.[0],
    contract.scheduleDays?.[1] ?? null,
    getHolidayMethod(contract.holidayType),
    0,
    0,
    0,
    "SIMPLE_INT",
    contract.endDate,
    null,
    contract.description,
    [],
    []
  ];

  const schedule = await fetchPolaris({
    op: "13610258",
    data: sendData,
    subdomain,
    polarisConfig
  });

  await updateContract(
    subdomain,
    { _id: contract._id },
    { $set: { isSyncedSchedules: true } },
    "loans"
  );

  return schedule;
};
