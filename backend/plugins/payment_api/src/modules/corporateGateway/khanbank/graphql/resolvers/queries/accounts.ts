import { IContext } from '~/connectionResolvers';
import Khanbank from '../../../khanbank/khanbank';

const queries = {
  async khanbankAccounts(
    _root,
    { configId }: { configId: string },
    { models }: IContext,
  ) {
    const config = await models.KhanbankConfigs.getConfig({ _id: configId });

    const khanbank = new Khanbank(config);

    try {
      return await khanbank.accounts.list();
    } catch (e: any) {
      console.error(e);
    }
  },

  async khanbankAccountDetail(
    _root,
    { configId, accountNumber }: { configId: string; accountNumber: string },
    { models }: IContext,
  ) {
    const config = await models.KhanbankConfigs.getConfig({ _id: configId });

    const khanbank = new Khanbank(config);

    try {
      return await khanbank.accounts.get(accountNumber);
    } catch (e: any) {
      console.error(e);
    }
  },

  async khanbankAccountHolder(
    _root,
    {
      configId,
      accountNumber,
      bankCode,
    }: { configId: string; accountNumber: string; bankCode?: string },
    { models }: IContext,
  ) {
    try {
      const config = await models.KhanbankConfigs.getConfig({ _id: configId });
      const khanbank = new Khanbank(config);

      return await khanbank.accounts.getHolder(accountNumber, bankCode);
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async khanbankStatements(
    _root,
    args: {
      configId: string;
      accountNumber: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      perPage?: number;
    },
    { models }: IContext,
  ) {
    const { configId } = args;

    try {
      const config = await models.KhanbankConfigs.getConfig({ _id: configId });
      const khanbank = new Khanbank(config);

      return await khanbank.statements.list(args);
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async khanbankStatementsAfterRecord(
    _root,
    args: {
      configId: string;
      accountNumber: string;
      record: number;
      page?: number;
      perPage?: number;
    },
    { models }: IContext,
  ) {
    const { configId } = args;

    try {
      const config = await models.KhanbankConfigs.getConfig({ _id: configId });
      const khanbank = new Khanbank(config);

      return await khanbank.statements.list(args);
    } catch (e) {
      throw new Error(e.message);
    }
  },
};

export default queries;
