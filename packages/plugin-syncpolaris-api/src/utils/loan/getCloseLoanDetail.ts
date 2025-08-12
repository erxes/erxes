import { fetchPolaris } from "../utils";
import * as moment from "moment";

export const getCloseLoanDetail = async (
  subdomain,
  polarisConfig,
  contract
) => {
  const loanCloseDetail = [contract.number, moment().format("YYYY-MM-DD")];

  const loanChangeClassificationReponse = await fetchPolaris({
    subdomain,
    op: "13610266",
    data: loanCloseDetail,
    polarisConfig
  });

  return loanChangeClassificationReponse;
};
