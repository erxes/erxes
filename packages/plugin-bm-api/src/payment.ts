import { sendMessage } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";

export default {
  transactionCallback: async ({ subdomain, data }) => {
    // TODO: implement transaction callback if necessary
  },
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    console.log("bm works");

    const { status, contentType, contentTypeId, amount, _id, currency } = data;
    console.log("content", data);

    if (contentType !== "bm:order" || status !== "paid") {
      return;
    }
    const order = await models.Orders.findById(contentTypeId);
    if (!order) return;
    const oldInvoice = order?.invoices?.find((x) => x._id === _id);
    const restInvoices = order?.invoices?.filter((x) => x._id !== _id) || [];
    const restTotal = restInvoices?.reduce((a, b) => a + b.amount, 0) || 0;
    const total = (oldInvoice?.amount || 0) + restTotal;
    const branch = await models.BmsBranch.findById(order.branchId);
    const tour = await models.Tours.getTour(order.tourId);

    if (order) {
      if (order?.amount <= total) {
        await models.Orders.updateOne(
          { _id: contentTypeId },
          {
            $set: {
              status: "paid",
              invoices: [...restInvoices, { _id, amount }]
            }
          }
        );
        await sendMessage({
          serviceName: "notifications",
          subdomain,
          action: "send",
          data: {
            notifType: `orderpaid`,
            title: "Хэрэглэгч төлбөр төлөв",
            content: `${amount} дүнтэй төлбөр төлөгдлөө, аялал: ${tour.name}`,
            action: `Reminder:`,
            link: `${order.id}`,

            // exclude current user
            contentType: "bm:order",
            contentTypeId: order._id,
            receivers: [
              ...(branch?.user1Ids || []),
              ...(branch?.user2Ids || [])
            ]
          }
        });
      } else if (order?.amount > 0) {
        await models.Orders.updateOne(
          { _id: contentTypeId },
          {
            $set: {
              status: "halfPaid",
              invoices: [...restInvoices, { _id, amount }]
            }
          }
        );
        await sendMessage({
          serviceName: "notifications",
          subdomain,
          action: "send",
          data: {
            notifType: `orderpaid`,
            title: "Хэрэглэгч төлбөр төлөв",
            content: `${amount} дүнтэй төлбөр төлөгдлөө, аялал: ${tour.name}`,
            action: `Reminder:`,
            link: `${order.id}`,

            // exclude current user
            contentType: "bm:order",
            contentTypeId: order._id,
            receivers: [
              ...(branch?.user1Ids || []),
              ...(branch?.user2Ids || [])
            ]
          }
        });
      }
    }
  }
};
