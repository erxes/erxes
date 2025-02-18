import { sendCoreMessage, sendMessageBroker } from "../../messageBroker";
import { IModels } from "../../connectionResolver";

const getFieldsWithCode = async (subdomain, contentType) => {
  return await sendMessageBroker(
    {
      subdomain,
      action: "fields.find",
      data: {
        query: {
          contentType,
          code: { $exists: true, $ne: "" }
        },
        projection: {
          groupId: 1,
          code: 1,
          _id: 1
        }
      },
      isRPC: true,
      defaultValue: []
    },
    "core"
  );
};

const getCustomerInfo = async (subdomain, type, id) => {
  if (type === "sales:deal") {
    const companyIds: string[] = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "deal",
        mainTypeId: id,
        relTypes: ["company"]
      },
      isRPC: true,
      defaultValue: []
    });

    if (companyIds?.length) {
      return { customerType: "company", customerId: companyIds[0] };
    }

    const customerIds: string[] = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "deal",
        mainTypeId: id,
        relTypes: ["customer"]
      },
      isRPC: true,
      defaultValue: []
    });

    if (customerIds?.length) {
      return { customerType: "customer", customerId: customerIds[0] };
    }
    return {};
  }

  if (type === "core:customer") {
    return { customerType: "customer", customerId: id };
  }

  if (type === "core:company") {
    return { customerType: "company", customerId: id };
  }

  return {};
};

const getProductInfo = async (models: IModels, type, object) => {
  if (type === 'sales:deal') {
    const { productsData } = object;
    if (!productsData?.length) {
      return {};
    }

    const contractType = await models.ContractTypes.findOne({ productId: { $in: productsData.map(p => p.productId) }, productType: 'public' }).lean();
    const leaseAmount = (productsData || []).reduce((sum, pd) => Number(sum) + Number(pd.unitPrice * pd.quantity), 0)

    return { contractTypeId: contractType?._id, leaseAmount, interestRate: contractType?.defaultInterest }
  }
  return {};
}

export const customFieldToObject = async (
  models: IModels,
  subdomain,
  customFieldType,
  object
) => {
  if (!object) {
    return {};
  }

  const result: any = {};

  const objFields = await getFieldsWithCode(subdomain, customFieldType);

  const customFieldsData: any[] = object.customFieldsData || [];
  for (const f of objFields) {
    const existingData = customFieldsData.find(c => c.field === f._id);
    result[f.code] = existingData?.value;
  }

  return {
    ...result,
    ...(await getCustomerInfo(subdomain, customFieldType, object._id)),
    ...(await getProductInfo(models, customFieldType, object))
  };
};
