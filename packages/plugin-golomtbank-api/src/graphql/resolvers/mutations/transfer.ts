import { IContext } from "../../../connectionResolver";
import { AccountsApi } from "../../../golomtBank/api/accounts";
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
      fromBank: string;
      toBank: string;
      toCurrency: string;
      toDescription: string;
      fromDescription: string;
      fromCurrency: string;
      fromAmount: string;
      toAmount: string;
      type: string;
    },
    { models }: IContext
  ) => {
    const {
      refCode,
      configId,
      fromAccount,
      toAccount,
      toAccountName,
      fromBank,
      toBank,
      toCurrency,
      toDescription,
      fromDescription,
      fromCurrency,
      toAmount,
      fromAmount,
      type,
    } = args;
    const config = await models.GolomtBankConfigs.getConfig({
      _id: configId,
    });
    if (!config) {
      throw new Error("Not found config");
    }

    const golomtBank = new GolomtBank(config);
    const initiatorAccount = await golomtBank.accounts.get(fromAccount);
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
        bank: fromBank,
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
