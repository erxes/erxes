import { fetchPolaris } from "../utils";

export const getCloseLoanDetail = async (
  subdomain,
  polarisConfig,
  classification
) => {
  const loanCloseDetail = [classification.number, new Date()];

  const loanChangeClassificationReponse = await fetchPolaris({
    subdomain,
    op: "13610266",
    data: loanCloseDetail,
    polarisConfig
  });

  return loanChangeClassificationReponse;
};
