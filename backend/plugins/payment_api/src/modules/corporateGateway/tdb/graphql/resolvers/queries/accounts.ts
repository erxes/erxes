import { IContext } from '~/connectionResolvers';
import { AccountsApi } from '../../../api/accounts';

const queries = {
  async tdbAccounts(
    _root,
    { configId }: { configId: string },
    { models }: IContext,
  ) {
    const config = await models.TdbConfigs.getConfig({
      _id: configId,
    });

    const accountsApi = new AccountsApi({
      apiUrl: config.apiUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    return accountsApi.list();
  },

  async tdbAccountBalance(
    _root,
    {
      configId,
      accountNumberOrIban,
    }: {
      configId: string;
      accountNumberOrIban: string;
    },
    { models }: IContext,
  ) {
    const config = await models.TdbConfigs.getConfig({
      _id: configId,
    });

    const accountsApi = new AccountsApi({
      apiUrl: config.apiUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    return accountsApi.getBalance(accountNumberOrIban);
  },

  async tdbAccountStatement(
    _root,
    args: {
      configId: string;
      accountNumberOrIban: string;
      from: string;
      to: string;
      page?: number;
      size?: number;
    },
    { models }: IContext,
  ) {
    const config = await models.TdbConfigs.getConfig({
      _id: args.configId,
    });

    const accountsApi = new AccountsApi({
      apiUrl: config.apiUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    return accountsApi.getStatement({
      accountNumberOrIban: args.accountNumberOrIban,
      from: args.from,
      to: args.to,
      page: args.page,
      size: args.size,
    });
  },
};

export default queries;