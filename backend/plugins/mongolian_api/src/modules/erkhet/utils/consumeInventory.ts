import { getConfig } from "./utils";
import { sendTRPCMessage } from "erxes-api-shared/src/utils";

export const consumeInventory = async (subdomain, doc, old_code, action) => {
  const product = await sendTRPCMessage({
    subdomain,
    pluginName: "core",
    method: "query",
    module: "products",
    action: "findOne",
    input: { code: old_code },
    defaultValue: {}
  });

  if ((action === "update" && old_code) || action === "create") {
    const productCategory = await sendTRPCMessage({
      subdomain,
      pluginName: "core",
      method: "query",
      module: "categories",
      action: "findOne",
      input: { code: doc.category_code },
      defaultValue: null
    });

    const config = await getConfig(subdomain, "ERKHET", {});

    const document: any = {
      name: doc.name || "",
      shortName: doc.nickname || "",
      type: doc.is_service ? "service" : "product",
      unitPrice: doc.unit_price,
      code: doc.code,
      productId: doc.id,
      uom: doc.measure_unit_code,
      subUoms: product?.subUoms,
      barcodes: doc.barcodes ? doc.barcodes.split(",") : [],
      categoryId: productCategory ? productCategory._id : product.categoryId,
      categoryCode: productCategory
        ? productCategory.code
        : product.categoryCode,
      status: "active"
    };

    const weightField = await sendTRPCMessage({
      subdomain,
      pluginName: "core",
      method: "query",
      module: "fields",
      action: "findOne",
      input: { query: { code: "weight" } },
      defaultValue: null
    });

    if (weightField && weightField._id) {
      const weightData = {
        field: weightField._id,
        value: doc.weight,
        stringValue: doc.weight.toString(),
        numberValue: Number(doc.weight)
      };

      if (product && product.customFieldsData) {
        const otherFieldsData = (product.customFieldsData || []).filter(
          cfd => cfd.field !== weightField._id
        );
        otherFieldsData.push(weightData);
        document.customFieldsData = otherFieldsData;
      } else {
        document.customFieldsData = [weightData];
      }
    }

    if (doc.sub_measure_unit_code && doc.ratio_measure_unit) {
      let subUoms = (product || {}).subUoms || [];
      const subUomCodes = subUoms.map(u => u.uom);

      if (subUomCodes.includes(doc.sub_measure_unit_code)) {
        subUoms = subUoms.filter(u => u.uom !== doc.sub_measure_unit_code);
      }
      subUoms.unshift({
        uom: doc.sub_measure_unit_code,
        ratio: doc.ratio_measure_unit
      });

      document.subUoms = subUoms;
    }

    if (config.consumeDescription) {
      doc.description = eval("`" + config.consumeDescription + "`");
    }

    if (product) {
      await sendTRPCMessage({
        subdomain,
        pluginName: "core",
        method: "mutation",
        module: "products",
        action: "updateProduct",
        input: { _id: product._id, doc: { ...document } }
      });
    } else {
      await sendTRPCMessage({
        subdomain,
        pluginName: "core",
        method: "mutation",
        module: "products",
        action: "createProduct",
        input: { doc: { ...document } }
      });
    }
  } else if (action === "delete" && product) {
    await sendTRPCMessage({
      subdomain,
      pluginName: "core",
      method: "mutation",
      module: "products",
      action: "removeProducts",
      input: { _ids: [product._id] }
    });
  }
};

export const consumeInventoryCategory = async (
  subdomain,
  doc,
  old_code,
  action
) => {
  const productCategory = await sendTRPCMessage({
    subdomain,
    pluginName: "core",
    method: "query",
    module: "categories",
    action: "findOne",
    input: { code: old_code },
    defaultValue: null
  });

  if ((action === "update" && old_code) || action === "create") {
    const parentCategory = await sendTRPCMessage({
      subdomain,
      pluginName: "core",
      method: "query",
      module: "categories",
      action: "findOne",
      input: { code: doc.parent_code },
      defaultValue: null
    });

    const document = {
      code: doc.code,
      name: doc.name,
      order: doc.order
    };

    if (productCategory) {
      await sendTRPCMessage({
        subdomain,
        pluginName: "core",
        method: "mutation",
        module: "categories",
        action: "updateProductCategory",
        input: {
          _id: productCategory._id,
          doc: {
            ...document,
            parentId: parentCategory
              ? parentCategory._id
              : productCategory.parentId
          }
        }
      });
    } else {
      await sendTRPCMessage({
        subdomain,
        pluginName: "core",
        method: "mutation",
        module: "categories",
        action: "createProductCategory",
        input: {
          doc: {
            ...document,
            parentId: parentCategory ? parentCategory._id : ""
          }
        }
      });
    }
  } else if (action === "delete" && productCategory) {
    await sendTRPCMessage({
      subdomain,
      pluginName: "core",
      method: "mutation",
      module: "categories",
      action: "removeProductCategory",
      input: { _id: productCategory._id }
    });
  }
};
