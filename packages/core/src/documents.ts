import { generateModels } from "./connectionResolver";
import { fieldsCombinedByContentType } from "./formUtils";
import productDocuments from "./data/modules/product/documents";

const getContactDetail = async (subdomain, contentType, contentTypeId) => {
  const models = await generateModels(subdomain);

  let contact;

  if (contentType === "core:customer") {
    contact = await models.Customers.findOne({ _id: contentTypeId });
  }
  if (contentType === "core:company") {
    contact = await models.Companies.findOne({ _id: contentTypeId });
  }

  return contact;
};

const getFields = async ({ subdomain, contentType }) => {
  if (contentType === "core:product") {
    return productDocuments.editorAttributes({ subdomain });
  }

  const models = await generateModels(subdomain);

  const fields = await fieldsCombinedByContentType(models, subdomain, {
    contentType
  });
  return fields.map(f => ({ value: f.name, name: f.label }));
};

export default {
  types: [
    {
      label: "Customer",
      type: "core:customer"
    },
    {
      label: "Company",
      type: "core:company"
    },
    {
      label: "Products",
      type: "core:product"
    }
  ],

  editorAttributes: async ({ subdomain, data }) => {
    const { contentType } = data;

    if (contentType === "core:product") {
      return productDocuments.editorAttributes({ subdomain });
    }

    return await getFields({ subdomain, contentType });
  },
  replaceContent: async ({ subdomain, data }) => {
    const { contentType, contentTypeId, content } = data;

    if (contentType === "core:product") {
      return productDocuments.replaceContent({ subdomain, data });
    }

    const contact = await getContactDetail(
      subdomain,
      contentType,
      contentTypeId
    );

    const models = await generateModels(subdomain);

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

    [
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
    ].forEach(field => {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field} }}`, "g"),
        contact[field] || ""
      );
    });

    ["createdAt", "modifiedAt", "birthDate"].forEach(field => {
      replacedContent = replacedContent.replace(
        new RegExp(` {{ ${field} }} `, "g"),
        contact[field] ? contact[field].toLocaleDateString() : ""
      );
    });

    if (replacedContent.includes(`{{ parentCompanyId }}`)) {
      const parent = await getContactDetail(
        subdomain,
        contentType,
        contact.parentCompanyId
      );

      if (parent) {
        replacedContent = replacedContent.replace(
          /{{ parentCompanyId }}/g,
          (parent?.names || []).join(",")
        );
      }
    }
    if (replacedContent.includes(`{{ ownerId }}`)) {
      const owner = await models.Users.getUser(contact.ownerId);

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
      const propertyNames = field.value.includes(".")
        ? field.value.split(".")
        : [field.value];
      let propertyValue = contact;

      for (const propertyName in propertyNames) {
        propertyValue = propertyValue[propertyName] || propertyValue;
      }

      replacedContent = replacedContent.replace(
        new RegExp(` {{ ${field.value} }} `, "g"),
        propertyValue || ""
      );
    }

    return [replacedContent];
  }
};
