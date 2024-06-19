import { IContext } from "../../../connectionResolver";
import GolomtBank from "../../../golomtBank/golomtBank";

const mutations = {
  golomtBankTransfer: async (
    _root,
    args: { configId: string; transfer: any },
    { models }: IContext
  ) => {
    const { transfer } = args;
    const config = await models.GolomtBankConfigs.getConfig({
      _id: args.configId,
    });

    const golomtBank = new GolomtBank(config);

    // if (transfer.type === "interbank") {
    //   return golomtBank.transfer.interbank(transfer);
    // }
    return golomtBank.transfer.transfer(transfer);
  },
};
export default mutations;
