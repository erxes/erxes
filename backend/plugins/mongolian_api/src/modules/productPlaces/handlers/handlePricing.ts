import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const handlePricing = async (subdomain, deal, productsData) => {
  const groupedData: Record<string, Record<string, any[]>> = {};

  for (const data of productsData) {
    const { branchId = '', departmentId = '' } = data;

    if (!groupedData[branchId]) {
      groupedData[branchId] = {};
    }
    if (!groupedData[branchId][departmentId]) {
      groupedData[branchId][departmentId] = [];
    }

    groupedData[branchId][departmentId].push(data);
  }

  let isSetPricing = false;
  let afterPricingData: any[] = [];

  for (const branchId of Object.keys(groupedData)) {
    for (const departmentId of Object.keys(groupedData[branchId])) {
      const perDatas = groupedData[branchId][departmentId];

      if (!perDatas.length) {
        continue;
      }

      const pricing = await sendTRPCMessage({
        subdomain,
        pluginName: 'pricing',
        module: 'pricing',
        action: 'checkPricing',
        method: 'query',
        input: {
          prioritizeRule: 'exclude',
          totalAmount: perDatas.reduce((sum, cur) => sum + cur.amount, 0),
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
        if (!discount) {
          continue;
        }

        isSetPricing = true;

        if (discount.type === 'percentage') {
          item.discountPercent = Number.parseFloat(
            ((discount.value / (item.unitPrice || 1)) * 100).toFixed(2),
          );
        }

        item.discount = discount.value * item.quantity;
        item.amount =
          ((item.globalUnitPrice || item.unitPrice) - discount.value) *
          item.quantity;
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

  return afterPricingData;
};
