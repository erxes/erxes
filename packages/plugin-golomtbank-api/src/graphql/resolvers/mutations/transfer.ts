import { IContext } from "../../../connectionResolver";
import GolomtBank from "../../../golomtBank/golomtBank";

const mutations = {
  golomtBankTransfer: async (
    _root,
    args: {
      refCode: string;
      configId: string;
      fromAccount: string;
      toAccount: string;
      toAccountName: string;
      toBank: string;
      toCurrency: string;
      toDescription: string;
      fromDescription: string;
      fromCurrency: string;
      fromAmount: string;
      toAmount: string;
    },
    { models }: IContext
  ) => {
    const {
      refCode,
      configId,
      fromAccount,
      toAccount,
      toAccountName,
      toBank,
      toCurrency,
      toDescription,
      fromDescription,
      fromCurrency,
      toAmount,
      fromAmount,
    } = args;
    const config = await models.GolomtBankConfigs.getConfig({
      _id: configId,
    });
    if (!config) {
      throw new Error("Not found config");
    }

    const golomtBank = new GolomtBank(config);
    const preData = {
      genericType: null,
      registerNumber: config.registerId,
      type: "TSF",
      refCode: refCode || "193",
      initiator: {
        genericType: null,
        acctName: "ОЧИР УНДРАА ОМЗ ББСБ",
        acctNo: fromAccount,
        amount: {
          value: Number(fromAmount),
          currency: fromCurrency,
        },
        particulars: fromDescription,
        bank: "15",
      },
      receives: [
        {
          genericType: null,
          acctName: toAccountName,
          acctNo: toAccount,
          amount: {
            value: Number(toAmount),
            currency: toCurrency || "MNT",
          },
          particulars: toDescription,
          bank: toBank,
        },
      ],
      remarks: fromDescription,
    };

    return golomtBank.transfer.transfer(preData);
  },
};
export default mutations;
