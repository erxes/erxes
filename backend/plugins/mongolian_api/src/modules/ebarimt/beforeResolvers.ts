import { generateModels } from '~/connectionResolvers';
import { companyCheckCode, getCompanyInfo } from './utils';

const resolvers = {
  contacts: ['companiesAdd', 'companiesEdit'],
  sales: ['dealsAdd', 'dealsEdit'],
};

export default resolvers;

export const beforeResolverHandlers = async (subdomain, params) => {
  const models = await generateModels(subdomain);
  const { resolver, args } = params;

  if (resolvers.sales.includes(resolver)) {
    const mainConfig = await models.Configs.getConfigValue('EBARIMT');

    if (
      Object.keys(args.propertiesData || {}).length &&
      mainConfig?.dealBillType?.regNo &&
      mainConfig?.dealBillType?.companyName
    ) {
      const regNoFieldId = mainConfig.dealBillType.regNo;
      const regNoData = args.propertiesData?.[regNoFieldId];

      if (regNoData) {
        const { status, tin, result } = await getCompanyInfo({
          checkTaxpayerUrl: mainConfig.checkTaxpayerUrl,
          no: regNoData,
        });

        if (status === 'checked' && tin) {
          args.propertiesData = {
            ...args.propertiesData,
            [mainConfig.dealBillType.companyName]: result.data?.name,
          };
        }
      }
    }
    return args;
  }

  if (resolvers.contacts.includes(resolver)) {
    return companyCheckCode(args, models);
  }

  return args;
};
