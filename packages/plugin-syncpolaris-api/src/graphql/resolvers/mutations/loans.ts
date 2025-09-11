import { IContext } from "../../../connectionResolver";
import { createCollateral } from "../../../utils/collateral/createCollateral";
import { activeLoan } from "../../../utils/loan/activeLoan";
import { createLoanClose } from "../../../utils/loan/closeLoan";
import { createLoanMessage } from "../../../utils/loan/createLoanMessage";
import { createLoanSchedule } from "../../../utils/loan/createSchedule";
import { createLoanGive } from "../../../utils/loan/loanGive";
import { createLoanRepayment } from "../../../utils/loan/loanRepayment";
import { getConfig } from "../../../utils/utils";

const loansMutations = {
  async sendContractToPolaris(
    _root,
    { data }: { data: any },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, "POLARIS", {});

    if (!config.token) {
      throw new Error("POLARIS config not found.");
    }

    await createLoanMessage(subdomain, config, data);

    return "success";
  },

  async syncLoanCollateral(
    _root,
    { data }: { data: any },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, "POLARIS", {});

    if (!config.token) {
      throw new Error("POLARIS config not found.");
    }

    await createCollateral(subdomain, config, data);

    return "success";
  },

  async sendLoanSchedules(
    _root,
    { data }: { data: any },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, "POLARIS", {});

    if (!config.token) {
      throw new Error("POLARIS config not found.");
    }

    await createLoanSchedule(subdomain, config, data);

    return "success";
  },

  async loanContractActive(
    _root,
    { contractNumber }: { contractNumber: string },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, "POLARIS", {});

    if (!config.token) {
      throw new Error("POLARIS config not found.");
    }

    await activeLoan(subdomain, config, contractNumber);

    return "success";
  },

  async loanGiveTransaction(
    _root,
    { data }: { data: any },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, "POLARIS", {});

    if (!config.token) {
      throw new Error("POLARIS config not found.");
    }

    await createLoanGive(subdomain, config, data);

    return "success";
  },
  async createLoanRepayment(
    _root,
    { data }: { data: any },
    { subdomain, models }: IContext
  ) {
    const config = await getConfig(subdomain, "POLARIS", {});

    if (!config.token) {
      throw new Error("POLARIS config not found.");
    }

    await createLoanRepayment(subdomain, models, config, data);

    return "success";
  },
  async closeLoanRepayment(
    _root,
    { data }: { data: any },
    { subdomain, models }: IContext
  ) {
    const config = await getConfig(subdomain, "POLARIS", {});

    if (!config.token) {
      throw new Error("POLARIS config not found.");
    }

    await createLoanClose(subdomain, models, config, data);

    return "success";
  },
};
export default loansMutations;
