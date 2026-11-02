import { IProductDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

interface IPdfBuyer {
  erxesCustomerId?: string;
  erxesCompanyId?: string;
}

const hasPaidOrder = async (
  subdomain: string,
  productId: string,
  { erxesCustomerId, erxesCompanyId }: IPdfBuyer,
) => {
  const owners: Record<string, unknown>[] = [];

  if (erxesCustomerId) {
    owners.push({
      customerId: erxesCustomerId,
      customerType: { $in: [null, '', 'customer'] },
    });
  }

  if (erxesCompanyId) {
    owners.push({ customerId: erxesCompanyId, customerType: 'company' });
  }

  if (!owners.length) {
    return false;
  }

  const order = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'orders',
    action: 'findOne',
    input: {
      query: {
        $or: owners,
        paidDate: { $ne: null },
        status: { $ne: 'return' },
        'items.productId': productId,
      },
    },
    defaultValue: null,
  });

  return Boolean(order?._id);
};

export const getBuyerPdfAttachment = async (
  subdomain: string,
  product: Pick<IProductDocument, '_id' | 'pdfAttachment'>,
  buyer?: IPdfBuyer | null,
) => {
  if (!product.pdfAttachment || !buyer) {
    return null;
  }

  const paid = await hasPaidOrder(subdomain, product._id, buyer);

  return paid ? product.pdfAttachment : null;
};
