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
    const { scopeBrandIds, result, contentType, properties } = data;
    const models = await generateModels(subdomain);

    if (["customer", "lead", "company"].includes(contentType)) {
      return await cocImport.prepareImportDocs({ subdomain, data });
    }

    if (contentType === "product") {
      return await productImport.prepareImportDocs({ subdomain, data });
    }

    const bulkDoc: any = [];

    // Iterating field values

    if (contentType === "product") {
      const defaultUom = await models.ProductsConfigs.getConfig(
        "defaultUOM",
        ""
      );

      for (const fieldValue of result) {
        const doc: any = {
          customFieldsData: []
        };

        let colIndex: number = 0;
        let subUomNames = [];
        let ratios = [];

        // Iterating through detailed properties
        for (const property of properties) {
          const value = (fieldValue[colIndex] || "").toString();

          switch (property.name) {
            case "customProperty":
              {
                doc.customFieldsData.push({
                  field: property.id,
                  value: fieldValue[colIndex]
                });

                doc.customFieldsData =
                  await models.Fields.prepareCustomFieldsData(
                    doc.customFieldsData
                  );
              }
              break;

            case "categoryName":
              {
                const category = await models.ProductCategories.findOne({
                  name: { $regex: new RegExp(`^${value}$`, "i") }
                });

                doc.categoryId = category ? category._id : "";
              }

              break;

            case "tag":
              {
                const tagName = value;

                let tag = await models.Tags.findOne({
                  name: tagName,
                  type: `core:product`
                });

                if (!tag) {
                  tag = await models.Tags.create({
                    name: tagName,
                    type: `core:product`
                  });
                }

                doc.tagIds = tag ? [tag._id] : [];
              }

              break;

            case "barcodes":
              {
                doc.barcodes = value
                  .replace(/\s/g, "")
                  .split(",")
                  .filter(br => br);
              }
              break;

            case "subUoms.uom":
              {
                subUomNames = value.replace(/\s/g, "").split(",");
              }
              break;

            case "subUoms.ratio":
              {
                ratios = value.replace(/\s/g, "").split(",");
              }
              break;

            case "uom":
              {
                doc.uom = value || defaultUom;
              }
              break;

            default:
              {
                doc[property.name] = value;

                if (property.name === "createdAt" && value) {
                  doc.createdAt = new Date(value);
                }

                if (property.name === "modifiedAt" && value) {
                  doc.modifiedAt = new Date(value);
                }

                if (property.name === "isComplete") {
                  doc.isComplete = Boolean(value);
                }
              }
              break;
          }

          colIndex++;
        }

        let ind = 0;
        const subUoms: any = [];

        for (const uom of subUomNames) {
          subUoms.push({
            id: Math.random(),
            uom: uom,
            ratio: Number(ratios[ind] || 1)
          });
          ind += 1;
        }
        doc.subUoms = subUoms;

        bulkDoc.push(doc);
      }

      return bulkDoc;
    }

    if (contentType === "user") {
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

    for (const fieldValue of result) {
      const doc: any = {
        scopeBrandIds,
        customFieldsData: []
      };

      let colIndex: number = 0;

      // Iterating through detailed properties
      for (const property of properties) {
        const value = (fieldValue[colIndex] || "").toString();

        if (contentType === "customer") {
          doc.state = "customer";
        }
        if (contentType === "lead") {
          doc.state = "lead";
        }

        switch (property.name) {
          case "customProperty":
            {
              doc.customFieldsData.push({
                field: property.id,
                value: fieldValue[colIndex]
              });

              doc.customFieldsData =
                await models.Fields.prepareCustomFieldsData(
                  doc.customFieldsData
                );
            }
            break;

          case "customData":
            {
              doc[property.name] = value;
            }
            break;

          case "ownerEmail":
            {
              const owner = await models.Users.findOne({ email: value });

              doc.ownerId = owner ? owner._id : "";
            }
            break;

          case "pronoun":
            {
              doc.sex = generatePronoun(value);
            }
            break;

          case "companiesPrimaryNames":
            {
              doc.companiesPrimaryNames = value.split(",");
            }
            break;

          case "companiesPrimaryEmails":
            {
              doc.companiesPrimaryEmails = value.split(",");
            }
            break;

          case "customersPrimaryEmails":
            doc.customersPrimaryEmails = value.split(",");
            break;

          case "vendorCode":
            doc.vendorCode = value;
            break;

          case "tag":
            {
              const type = contentType === "lead" ? "customer" : contentType;

              const tagName = value;

              let tag = await models.Tags.findOne({
                name: tagName,
                type: `core:${type}`
              });

              if (!tag) {
                tag = await models.Tags.create({
                  name: tagName,
                  type: `core:${type}`
                });
              }

              doc.tagIds = tag ? [tag._id] : [];
            }

            break;

          case "assignedUserEmail":
            {
              const assignedUser = await models.Users.findOne({ email: value });

              doc.assignedUserIds = assignedUser ? [assignedUser._id] : [];
            }

            break;

          default:
            {
              doc[property.name] = value;

              if (property.name === "createdAt" && value) {
                doc.createdAt = new Date(value);
              }

              if (property.name === "modifiedAt" && value) {
                doc.modifiedAt = new Date(value);
              }

              if (property.name === "primaryName" && value) {
                doc.names = [value];
              }

              if (property.name === "primaryEmail" && value) {
                doc.emails = [value];
              }

              if (property.name === "primaryPhone" && value) {
                doc.phones = [value];
              }

              if (property.name === "phones" && value) {
                doc.phones = value.split(",");
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
        } // end property.type switch

        colIndex++;
      } // end properties for loop

      if (
        (contentType === "customer" || contentType === "lead") &&
        !doc.emailValidationStatus
      ) {
        doc.emailValidationStatus = "unknown";
      }

      if (
        (contentType === "customer" || contentType === "lead") &&
        !doc.phoneValidationStatus
      ) {
        doc.phoneValidationStatus = "unknown";
      }

      // set board item created user

      bulkDoc.push(doc);
    }

    return bulkDoc;
  }
};
