import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { sendCommonMessage, sendCoreMessage } from "../messageBroker";
import { dateToShortStr } from "@erxes/api-utils/src";
import * as moment from "moment";

const toMoney = value => {
  if (!value) {
    return "-";
  }
  return new Intl.NumberFormat().format(value);
};
export default {
  types: [
    {
      label: "Products",
      contentType: "core:product"
    }
  ],
  editorAttributes: async ({ subdomain, data: { contentType } }) => {
    console.log({ subdomain, contentType });
    const customFields = await sendCoreMessage({
      subdomain,
      action: "fields.fieldsCombinedByContentType",
      data: { contentType },
      isRPC: true,
      defaultValue: []
    });

    const fields = customFields
      .filter(field => !["categoryId", "code"].includes(field.name))
      .map(field => ({
        value: field.name,
        name: field.label,
        type: field.type
      }));

    return [
      { value: "name", name: "Name" },
      { value: "shortName", name: "Short name" },
      { value: "code", name: "Code" },
      { value: "price", name: "Price" },
      { value: "bulkQuantity", name: "Bulk quantity" },
      { value: "bulkPrice", name: "Bulk price" },
      { value: "barcode", name: "Barcode" },
      { value: "barcodeText", name: "Barcode Text" },
      { value: "date", name: "Date" },
      { value: "barcodeDescription", name: "Barcode description" },

      ...fields
    ];
  },
  replaceContent: async ({ subdomain, data }) => {
    {
      const { branchId, departmentId, date, isDate, content } = data;
      const results: string[] = [];
      const copies = JSON.parse(data?.productIds || "[]");
      const productIds = copies.map(c => c.id);

      const products = await sendCoreMessage({
        subdomain,
        action: "products.find",
        data: {
          query: {
            _id: { $in: productIds }
          }
        },
        isRPC: true,
        defaultValue: []
      });

      const productById = {};
      for (const product of products) {
        productById[product._id] = product;
      }

      const pricingAvailable = await isEnabled("pricing");
      let quantityRules = {};

      if (content.includes("{{ barcode }}")) {
        results.push(
          '::heads::<script src="https://nmgplugins.s3.us-west-2.amazonaws.com/JsBarcode.all.min.js"></script><script src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/jquery.js"></script>'
        );
      }

      if (pricingAvailable) {
        const pricing = await sendCommonMessage({
          subdomain,
          serviceName: "pricing",
          action: "checkPricing",
          data: {
            prioritizeRule: "only",
            totalAmount: 0,
            departmentId,
            branchId,
            products: products.map(pr => ({
              itemId: pr._id,
              productId: pr._id,
              quantity: 1,
              price: pr.unitPrice
            }))
          },
          isRPC: true,
          defaultValue: {}
        });

        for (const product of products) {
          const discount = pricing[product._id] || {};

          if (Object.keys(discount).length) {
            let unitPrice = (product.unitPrice =
              (product.unitPrice || 0) - discount.value);
            if (unitPrice < 0) {
              unitPrice = 0;
            }
          }
        }

        quantityRules = await sendCommonMessage({
          subdomain,
          serviceName: "pricing",
          action: "getQuantityRules",
          isRPC: true,
          defaultValue: [],
          data: {
            prioritizeRule: "exclude",
            branchId,
            departmentId,
            products
          }
        });
      }

      for (const copyInfo of copies) {
        const product = productById[copyInfo.id];
        const qtyRule = quantityRules[product._id] || {};
        const { value, price } = qtyRule;

        let replacedContent = content;

        replacedContent = replacedContent.replace("{{ name }}", product.name);
        replacedContent = replacedContent.replace("{{ code }}", product.code);

        replacedContent = replacedContent.replace(
          "{{ price }}",
          toMoney(product.unitPrice)
        );

        replacedContent = replacedContent.replace(
          "{{ bulkQuantity }}",
          value || "-"
        );
        replacedContent = replacedContent.replace(
          "{{ bulkPrice }}",
          toMoney(price)
        );

        if (
          content.includes("{{ barcode }}") ||
          content.includes("{{ barcodeText }}")
        ) {
          let barcode = (product.barcodes || [])[0] || "";
          let shortStr = "";
          if (barcode) {
            if (["1", "true", "True"].includes(isDate)) {
              shortStr = `_${dateToShortStr(date, 92, "h")}`;
            }

            replacedContent = replacedContent.replace(
              "{{ barcode }}",
              `
              <p style="text-align: center;">
              <svg id="barcode${barcode}"></svg>
              </p>
              <script>
                JsBarcode("#barcode${barcode}", "${barcode}${shortStr}", {
                  width: 1,
                  height: 40,
                  displayValue: false
                });
              </script>
            `
            );

            replacedContent = replacedContent.replace(
              "{{ barcodeText }}",
              `<span class="barcodeText">${barcode}${shortStr}</span>`
            );
          } else {
            replacedContent = replacedContent.replace("{{ barcode }}", "");
            replacedContent = replacedContent.replace("{{ barcodeText }}", "");
          }
        }

        replacedContent = replacedContent.replace(
          "{{ date }}",
          moment(value).format("YYYY-MM-DD HH:mm")
        );

        replacedContent = replacedContent.replace(
          "{{ barcodeDescription }}",
          product.barcodeDescription || ""
        );

        if (replacedContent.includes(`{{ vendorId }}`)) {
          const vendor = await sendCoreMessage({
            subdomain,
            action: "companies.findOne",
            data: { _id: product.vendorId },
            isRPC: true,
            defaultValue: null
          });

          if (vendor?.primaryName) {
            replacedContent = replacedContent.replace(
              /{{ vendorId }}/g,
              vendor.primaryName
            );
          }
        }

        for (const customFieldData of product.customFieldsData || []) {
          replacedContent = replacedContent.replace(
            new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, "g"),
            customFieldData.value
          );
        }

        for (let i = 0; i < copyInfo.c; i++) {
          results.push(replacedContent);
        }
      }

      return results;
    }
  }
};
