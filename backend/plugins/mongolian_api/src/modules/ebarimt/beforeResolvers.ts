import { companyCheckCode, getCompanyInfo, getConfig } from "./utils";

const resolvers = {
  contacts: ["companiesAdd", "companiesEdit"],
  sales: ["dealsAdd", "dealsEdit"]
};

export default resolvers;

export const beforeResolverHandlers = async (params) => {
  const { resolver, args } = params;

  if (resolvers.sales.includes(resolver)) {
    const mainConfig = await getConfig("EBARIMT", {});
    if (
      args.customFieldsData?.length &&
      mainConfig?.dealBillType?.regNo &&
      mainConfig?.dealBillType?.companyName
    ) {
      const customsData = args.customFieldsData;
      const regNoFieldId = mainConfig.dealBillType.regNo;

      const regNoData = customsData.find(cd => cd.field === regNoFieldId);

      if (regNoData) {
        const { status, tin, result } = await getCompanyInfo({
          checkTaxpayerUrl: mainConfig.checkTaxpayerUrl,
          no: regNoData.value
        });

        if (status === "checked" && tin) {
          args.customFieldsData = args.customFieldsData.filter(
            cd => cd.field !== mainConfig.dealBillType.companyName
          );
          args.customFieldsData.push({
            field: mainConfig.dealBillType.companyName,
            value: result.data?.name
          });
        }
      }
    }
    return args;
  }

  if (resolvers.contacts.includes(resolver)) {
    return companyCheckCode(args);
  }

  return args;
};
