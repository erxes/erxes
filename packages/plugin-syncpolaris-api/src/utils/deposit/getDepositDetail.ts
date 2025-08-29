import { fetchPolaris } from "../utils";

export const getDepositDetail = async (subdomain, polarisConfig, params) => {
  return await fetchPolaris({
    subdomain,
    op: "13610000",
    data: [params.number, 0],
    polarisConfig
  });
};
