import { sendCoreMessage, sendMessageBroker } from "../../messageBroker";

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
    "forms"
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

  if (type === "contacts:customer") {
    return { customerType: "customer", customerId: id };
  }

  if (type === "contacts:company") {
    return { customerType: "company", customerId: id };
  }

  return {};
};

export const customFieldToObject = async (
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
    ...(await getCustomerInfo(subdomain, customFieldType, object._id))
  };
};
