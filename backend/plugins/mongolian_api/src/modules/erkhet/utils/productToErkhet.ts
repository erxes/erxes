import { sendTRPCMessage } from "erxes-api-shared/src/utils";
import { toErkhet } from "./utils";

export const productCategoryToErkhet = async (
  subdomain,
  models,
  mainConfig,
  syncLog,
  params,
  action
) => {
  const productCategory = params.updatedDocument || params.object;
  const oldProductCategory = params.object;

  const parentProductCategory = await sendTRPCMessage({
    subdomain,
    pluginName: "core",
    module: "categories",
    action: "findOne",
    input: { _id: productCategory.parentId },
    defaultValue: null
  });

  const sendData = {
    action,
    oldCode: oldProductCategory.code || productCategory.code || "",
    object: {
      code: productCategory.code || "",
      name: productCategory.name || "",
      parentCode: parentProductCategory ? parentProductCategory.code : ""
    }
  };

  await toErkhet(models, syncLog, mainConfig, sendData, "product-change");
};

export const productToErkhet = async (
  subdomain,
  models,
  mainConfig,
  syncLog,
  params,
  action
) => {
  const product = params.updatedDocument || params.object;
  const oldProduct = params.object;

  const productCategory = await sendTRPCMessage({
    subdomain,
    pluginName: "core",
    module: "categories",
    action: "findOne",
    input: { _id: product.categoryId },
    defaultValue: null
  });

  const weightField = await sendTRPCMessage({
    subdomain,
    pluginName: "core",
    module: "fields",
    action: "findOne",
    input: { query: { code: "weight" } },
    defaultValue: null
  });

  let weight;
  if (weightField && weightField._id) {
    const weightData = (product.customFieldsData || []).find(
      cfd => cfd.field === weightField._id
    );
    if (weightData && weightData.value) {
      weight = Number(weightData.value) || undefined;
    }
  }

  let subMeasureUnit;
  let ratioMeasureUnit;

  if (product.subUoms && product.subUoms.length) {
    const subUom = product.subUoms[0];
    subMeasureUnit = subUom.uom;
    ratioMeasureUnit = subUom.ratio;
  }

  const sendData = {
    action,
    oldCode: oldProduct.code || product.code || "",
    object: {
      code: product.code || "ш",
      name: product.name || "",
      nickname: product.shortName || "",
      measureUnit: product.uom,
      subMeasureUnit,
      ratioMeasureUnit,
      barcodes: product.barcodes.join(","),
      unitPrice: product.unitPrice || 0,
      costAccount: mainConfig.costAccount,
      saleAccount: mainConfig.saleAccount,
      categoryCode: productCategory ? productCategory.code : "",
      defaultCategory: mainConfig.productCategoryCode,
      weight
    }
  };

  await toErkhet(models, syncLog, mainConfig, sendData, "product-change");
};
