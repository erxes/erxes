import { getConfig, sendNotification } from "./utils";
import { sendRequest } from "@erxes/api-utils/src";

export const validCompanyCode = async (config, companyCode) => {
  let result = false;

  const re = new RegExp("(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\\d{7}$)", "gui");

  if (re.test(companyCode)) {
    const response = await sendRequest({
      url: config.checkCompanyUrl,
      method: "GET",
      params: { regno: companyCode },
    });

    if (response.found) {
      result = response.name;
    }
  }
  return result;
};

export const companyCheckCode = async (
  user,
  models,
  memoryStorage,
  graphqlPubsub,
  params,
  subdomain
) => {
  const config = await getConfig(subdomain, "EBARIMT", {});
  const company = params.updatedDocument || params.object;
  const companyName = await validCompanyCode(config, company.code);

  if (companyName) {
    if (company.primaryName !== companyName) {
      company.primaryName = companyName;

      await models.Companies.updateCompany(company._id, {
        company,
        primaryName: companyName,
        names: [companyName],
      });
    }
  } else {
    sendNotification(models, memoryStorage, {
      createdUser: user,
      receivers: [user._id],
      title: "wrong company code",
      content: `Байгууллагын код буруу бөглөсөн байна. "${company.code}"`,
      notifType: "companyMention",
      link: `/companies/details/${company._id}`,
      action: "update",
      contentType: "company",
      contentTypeId: company._id,
    });
  }
};
