import { ICompanyDocument } from "../../models/definitions/companies";
import { sendConformityMessage } from "../../messageBroker";
import { IContext } from "../../connectionResolver";

export default {
  __resolveReference({ _id }, { models: { Companies } }: IContext) {
    return Companies.findOne({ _id });
  },

  async customers(
    company: ICompanyDocument,
    _,
    { models: { Customers } }: IContext
  ) {
    const customerIds = await sendConformityMessage("savedConformity", {
      mainType: "company",
      mainTypeId: company._id,
      relTypes: ["customer"],
    });

    return Customers.find({ _id: { $in: customerIds || [] } });
  },

  async getTags(company: ICompanyDocument) {
    return (company.tagIds || []).map((_id) => ({ __typename: "Tag", _id }));
  },

  owner(company: ICompanyDocument) {
    if (!company.ownerId) {
      return;
    }

    return { __typename: "User", _id: company.ownerId };
  },

  parentCompany(
    { parentCompanyId }: ICompanyDocument,
    _,
    { models: { Companies } }: IContext
  ) {
    return Companies.findOne({ _id: parentCompanyId });
  },
};
