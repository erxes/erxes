import { isEnabled } from 'erxes-api-shared/utils';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { setPlace } from "./utils/setPlace";
import { splitData } from "./utils/splitData";
import { getConfig, getCustomer } from "./utils/utils";

export default {
  "sales:deal": ["update"]
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  if (type === "sales:deal") {
    if (action === "update") {
      const deal = params.updatedDocument;
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || "";

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      if (!(deal.productsData && deal.productsData.length)) {
        return;
      }

      const splitConfigs = await getConfig(
        subdomain,
        "dealsProductsDataSplit",
        {}
      );
      const placeConfigs = await getConfig(
        subdomain,
        "dealsProductsDataPlaces",
        {}
      );
      const printConfigs = await getConfig(
        subdomain,
        "dealsProductsDataPrint",
        {}
      );

      if (
        !(
          Object.keys(splitConfigs).includes(destinationStageId) ||
          Object.keys(placeConfigs).includes(destinationStageId) ||
          Object.keys(printConfigs).includes(destinationStageId)
        )
      ) {
        return;
      }

      let pDatas = deal.productsData;
      const products = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        method: 'query',
        input: {
          query: { _id: { $in: pDatas.map((pd) => pd.productId) } },
          limit: pDatas.length,
        },
        defaultValue: [],
      });

      const productById = {};
      for (const product of products) {
        productById[product._id] = product;
      }

      if (Object.keys(splitConfigs).includes(destinationStageId)) {
        pDatas = await splitData(
          subdomain,
          deal._id,
          pDatas,
          splitConfigs[destinationStageId],
          productById
        );
      }

      if (Object.keys(placeConfigs).includes(destinationStageId)) {
        const placeConfig = placeConfigs[destinationStageId];
        pDatas = await setPlace(
          subdomain,
          deal._id,
          pDatas,
          placeConfig,
          productById
        );

        if ((await isEnabled("pricing")) && placeConfig.checkPricing) {
          const groupedData: any = {};
          for (const data of pDatas) {
            const { branchId = "", departmentId = "" } = data;

            if (!Object.keys(groupedData).includes(branchId)) {
              groupedData[branchId] = {};
            }

            if (!Object.keys(groupedData[branchId]).includes(departmentId)) {
              groupedData[branchId][departmentId] = [];
            }

            groupedData[branchId][departmentId].push(data);
          }

          let isSetPricing = false;
          let afterPricingData = [];

          for (const branchId of Object.keys(groupedData)) {
            for (const departmentId of Object.keys(groupedData[branchId])) {
              const perDatas = groupedData[branchId][departmentId];

              if (perDatas.length) {
                const pricing = await sendTRPCMessage({
                  subdomain,
                  pluginName: 'pricing',
                  module: 'pricing',
                  action: 'checkPricing',
                  method: 'query',
                  input: {
                    prioritizeRule: 'exclude',
                    totalAmount: perDatas.reduce(
                      (sum, cur) => sum + cur.amount,
                      0,
                    ),
                    departmentId,
                    branchId,
                    products: perDatas.map((i) => ({
                      itemId: i._id,
                      productId: i.productId,
                      quantity: i.quantity,
                      price: i.unitPrice,
                    })),
                  },
                  defaultValue: {},
                });


                for (const item of perDatas) {
                  const discount = pricing[item._id];

                  if (discount) {
                    isSetPricing = true;

                    if (discount.type === "percentage") {
                      item.discountPercent = Number.parseFloat(
                        (
                          (discount.value / (item.unitPrice || 1)) *
                          100
                        ).toFixed(2)
                      );
                      item.discount = discount.value * item.quantity;
                      item.amount =
                        ((item.globalUnitPrice || item.unitPrice) -
                          discount.value) *
                        item.quantity;
                    } else {
                      item.discount = discount.value * item.quantity;
                      item.amount =
                        ((item.globalUnitPrice || item.unitPrice) -
                          discount.value) *
                        item.quantity;
                    }
                  }
                }
              }

              afterPricingData = afterPricingData.concat(perDatas);
            }
          }

          if (isSetPricing) {
            await sendTRPCMessage({
              subdomain,
              pluginName: 'sales',
              module: 'deals',
              action: 'updateOne',
              method: 'mutation',
              input: {
                selector: { _id: deal._id },
                modifier: { $set: { productsData: afterPricingData } },
              },
            });

          }
          pDatas = afterPricingData;
        }
      }

      if (Object.keys(printConfigs).includes(destinationStageId)) {
        const printConfig = printConfigs[destinationStageId];

        if (printConfig.conditions.length) {
          const { customerCode, customerName } = await getCustomer(
            subdomain,
            deal
          );

          const branchIds = pDatas.map(pd => pd.branchId);
          const branches = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            module: 'branches',
            action: 'find',
            method: 'query',
            input: {
              query: { _id: { $in: branchIds } },
            },
          });


          const branchById = {};
          for (const branch of branches) {
            branchById[branch._id] = branch;
          }

          const departmentIds = pDatas.map(pd => pd.departmentId);
          const departments = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            module: 'departments',
            action: 'find',
            method: 'query',
            input: {
              _id: { $in: departmentIds },
            },
          });


          const departmentById = {};
          for (const department of departments) {
            departmentById[department._id] = department;
          }

          // await sendTRPCMessage({
          //   subdomain,
          //   pluginName: 'core',
          //   module: 'branches',
          //   action: 'find',
          //   method: 'query',
          //   input: {},
          // });
          const content: any = [];

          for (const condition of printConfig.conditions) {
            const filteredData = pDatas.filter(
              pd =>
                pd.branchId === condition.branchId &&
                pd.departmentId === condition.departmentId
            );
            if (filteredData.length) {
              content.push({
                branchId: condition.branchId,
                branch: branchById[condition.branchId],
                departmentId: condition.departmentId,
                department: departmentById[condition.departmentId],
                date: new Date(),
                name: deal.name,
                number: deal.number,
                customerCode,
                customerName,
                pDatas: filteredData.map(fd => ({
                  ...fd,
                  product: productById[fd.productId]
                })),
                amount: filteredData.reduce((sum, i) => sum + i.amount, 0)
              });
            }
          }

          if (content.length) {
            await graphqlPubsub.publish(`productPlacesResponded:${user._id}`, {
              productPlacesResponded: {
                userId: user._id,
                responseId: deal._id,
                sessionCode: user.sessionCode || "",
                content
              }
            });
          }
        }
      }
    }
    return;
  }
};
