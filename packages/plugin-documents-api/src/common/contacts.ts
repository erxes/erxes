import { sendCoreMessage } from "../messageBroker";

const COMMON_CONTACT_FIELDS = [
  "status",
  "primaryName",
  "primaryPhone",
  "primaryEmail",
  "firstName",
  "lastName",
  "middleName",
  "sex",
  "score",
  "position",
  "department",
  "code",
  "country",
  "city",
  "region",
  "industry"
];

const getFields = async ({ subdomain, contentType }) => {
  const fields = await sendCoreMessage({
    subdomain,
    action: "fields.fieldsCombinedByContentType",
    data: { contentType },
    isRPC: true,
    defaultValue: []
  });
  return fields.map(f => ({ value: f.name, name: f.label }));
};

export default {
  types: [
    {
      label: "Customer",
      contentType: "core:customer"
    },
    {
      label: "Company",
      contentType: "core:company"
    }
  ],
  editorAttributes: async ({ subdomain, data }) => {
    const { contentType } = data;

    return getFields({ subdomain, contentType });
  },
  replaceContactContent: async ({ subdomain, data }) => {
    const { contentType, contentTypeId, content } = data;

    const [_, type] = contentType.split(":");

    const contactActionNames = {
      customer: "customers",
      company: "companies"
    };

    const contact = await sendCoreMessage({
      subdomain,
      action: `${contactActionNames[type]}.findOne`,
      data: {
        _id: contentTypeId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!contact) {
      return "";
    }

    let replacedContent: any = content || {};

    ["names", "emails", "phones"].forEach(field => {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field} }}`, "g"),
        (contact[field] || []).join(", ")
      );
    });

    COMMON_CONTACT_FIELDS.forEach(field => {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field} }}`, "g"),
        contact[field] || ""
      );
    });

    ["createdAt", "modifiedAt", "birthDate"].forEach(field => {
      if (replacedContent.includes(`{{ ${field} }}`)) {
        replacedContent = replacedContent.replace(
          new RegExp(` {{ ${field} }} `, "g"),
          contact[field] ? new Date(contact[field]).toLocaleDateString() : ""
        );
      }
    });

    if (replacedContent.includes(`{{ parentCompanyId }}`)) {
      const parent = await sendCoreMessage({
        subdomain,
        action: `${contactActionNames[type]}.findOne`,
        data: {
          _id: contact.parentCompanyId
        },
        isRPC: true,
        defaultValue: null
      });
      if (parent) {
        replacedContent = replacedContent.replace(
          /{{ parentCompanyId }}/g,
          (parent?.names || []).join(",")
        );
      }
    }

    if (replacedContent.includes(`{{ ownerId }}`)) {
      const owner = await sendCoreMessage({
        subdomain,
        action: "users.findOne",
        data: {
          _id: contact.ownerId
        },
        isRPC: true,
        defaultValue: null
      });

      if (owner && owner.details) {
        if (owner.details.firstName && owner.details.lastName) {
          replacedContent = replacedContent.replace(
            /{{ ownerId }}/g,
            `${owner?.details.firstName} ${owner?.details.lastName}`
          );
        } else {
          replacedContent = replacedContent.replace(
            /{{ ownerId }}/g,
            owner?.email || ""
          );
        }
      }
    }

    for (const customFieldData of contact.customFieldsData) {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, "g"),
        customFieldData.stringValue
      );
    }

    const fields = (await getFields({ subdomain, contentType })).filter(
      customField => !customField.value.includes("customFieldsData")
    );

    for (const field of fields) {
      const propertyNames = field.value.split(".");
      let propertyValue = "";

      for (const propertyName of propertyNames) {
        propertyValue = contact[propertyName] || propertyValue;
      }

      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field.value} }}`, "g"),
        propertyValue || ""
      );
    }

    return [replacedContent];
  }
};
