import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import Khanbank from '../../../khanbank/khanbank';

const queries = {
  async khanbankAccounts(
    _root,
    { configId }: { configId: string },
    { models }: IContext
  ) {
    const config = await models.KhanbankConfigs.getConfig({ _id: configId });

    const khanbank = new Khanbank(config);

    try {
      return khanbank.accounts.list();
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async khanbankAccountDetail(
    _root,
    { configId, accountNumber }: { configId: string; accountNumber: string },
    { models }: IContext
  ) {
    const config = await models.KhanbankConfigs.getConfig({ _id: configId });

    const khanbank = new Khanbank(config);

    try {
      return khanbank.accounts.get(accountNumber);
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async khanbankAccountHolder(
    _root,
    {
      configId,
      accountNumber,
      bankCode
    }: { configId: string; accountNumber: string; bankCode?: string },
    { models }: IContext
  ) {
    try {
      const config = await models.KhanbankConfigs.getConfig({ _id: configId });
      const khanbank = new Khanbank(config);

      return khanbank.accounts.getHolder(accountNumber, bankCode);
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
    { models }: IContext
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
    { models }: IContext
  ) {
    const { configId } = args;

    try {
      const config = await models.KhanbankConfigs.getConfig({ _id: configId });
      const khanbank = new Khanbank(config);

      return await khanbank.statements.list(args);
    } catch (e) {
      throw new Error(e.message);
    }
  }
};

requireLogin(queries, 'khanbankAccounts');
requireLogin(queries, 'khanbankAccountDetail');
requireLogin(queries, 'khanbankAccountHolder');
requireLogin(queries, 'khanbankStatements');
requireLogin(queries, 'khanbankStatementsAfterRecord');

checkPermission(queries, 'khanbankAccounts', 'khanbankAccounts');
checkPermission(
  queries,
  'khanbankAccountDetail',
  'khanbankAccountDetail',
  null
);
checkPermission(
  queries,
  'khanbankAccountHolder',
  'khanbankAccountDetail',
  null
);
checkPermission(
  queries,
  'khanbankStatements',
  'khanbankTransactionsShow',
  null
);
checkPermission(
  queries,
  'khanbankStatementsAfterRecord',
  'khanbankTransactionsShow',
  null
);

export default queries;
