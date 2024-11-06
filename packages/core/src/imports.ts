import { InterMessage } from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "./connectionResolver";
import { generatePronoun } from "./importUtils";
import cocImport from "./data/modules/coc/import";
import productImport from "./data/modules/product/imports";

const IMPORT_EXPORT_TYPES = [
  {
    text: "Team member",
    contentType: "user",
    icon: "user-square"
  },
  {
    text: "Customers",
    contentType: "customer",
    icon: "users-alt"
  },
  {
    text: "Leads",
    contentType: "lead",
    icon: "file-alt"
  },
  {
    text: "Companies",
    contentType: "company",
    icon: "building"
  },
  {
    text: "Product & Services",
    contentType: "product",
    icon: "server-alt"
  }
];

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,
  insertImportItems: async ({ subdomain, data }: InterMessage) => {
    const models = await generateModels(subdomain);
    const { docs, user, contentType } = data;

    if (["customer", "lead", "company"].includes(contentType)) {
      return await cocImport.insertImportItems({ subdomain, data });
    }
    if (contentType === "product") {
      return await productImport.insertImportItems({ subdomain, data });
    }

    try {
      const objects = await models.Users.insertMany(docs);
      return { objects, updated: 0 };
    } catch (e) {
      return { error: e.message };
    }
  },

  prepareImportDocs: async ({ subdomain, data }: InterMessage) => {
    const { result, contentType, properties } = data;

    if (["customer", "lead", "company"].includes(contentType)) {
      return await cocImport.prepareImportDocs({ subdomain, data });
    }

    if (contentType === "product") {
      return await productImport.prepareImportDocs({ subdomain, data });
    }

    const models = await generateModels(subdomain);

    const bulkDoc: any = [];

    // Iterating field values
    for (const fieldValue of result) {
      const doc: any = {};

      let colIndex: number = 0;

      // Iterating through detailed properties
      for (const property of properties) {
        const value = (fieldValue[colIndex] || "").toString();

        switch (property.name) {
          case "customProperty":
            {
              doc.customFieldsData =
                await models.Fields.prepareCustomFieldsData(
                  doc.customFieldsData
                );
              doc.customFieldsData.push({
                field: property.id,
                value: fieldValue[colIndex]
              });
            }
            break;

          case "password":
            {
              doc.password = await models.Users.generatePassword(value);
            }
            break;

          case "departments":
            {
              const departmentTitles = value.split(",");

              const departmentIds = await models.Departments.find({
                title: { $in: departmentTitles }
              }).distinct("_id");

              doc.departmentIds = departmentIds;
            }
            break;

          case "branches":
            {
              const branchTitles = value.split(",");

              const branchIds = await models.Branches.find({
                title: { $in: branchTitles }
              }).distinct("_id");

              doc.branchIds = branchIds;
            }
            break;

          case "customData":
            {
              doc[property.name] = value;
            }
            break;

          default:
            {
              doc[property.name] = value;

              if (property.name === "createdAt" && value) {
                doc.createdAt = new Date(value);
              }

              if (property.name === "emails" && value) {
                doc.emails = value.split(",");
              }

              if (property.name === "names" && value) {
                doc.names = value.split(",");
              }

              if (property.name === "isComplete") {
                doc.isComplete = Boolean(value);
              }
            }
            break;
        }

        colIndex++;
      }

      bulkDoc.push(doc);
    }

    return bulkDoc;
  }
};
