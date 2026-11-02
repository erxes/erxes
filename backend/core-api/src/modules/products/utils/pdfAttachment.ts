import { IAttachment, IProductDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IModels } from '~/connectionResolvers';
import { readFileUrl } from '~/utils/email/links';

const PDF_FILE_TOKEN_TTL_SECONDS = 60 * 60;

const getFileTokenSecret = () => process.env.JWT_TOKEN_SECRET || 'SECRET';

interface IPdfBuyer {
  erxesCustomerId?: string;
  erxesCompanyId?: string;
}

const signPdfFile = <T extends IAttachment>(subdomain: string, file: T): T => {
  if (!file.url || /^https?:\/\//i.test(file.url)) {
    return file;
  }

  const token = jwt.sign({ key: file.url, subdomain }, getFileTokenSecret(), {
    expiresIn: PDF_FILE_TOKEN_TTL_SECONDS,
  });

  return { ...file, url: `${readFileUrl(subdomain, file.url)}&token=${token}` };
};

export const verifyPdfFileToken = (
  token: unknown,
  key: string,
  subdomain: string,
) => {
  if (typeof token !== 'string') {
    return false;
  }

  try {
    const payload = jwt.verify(token, getFileTokenSecret()) as JwtPayload;

    return payload.key === key && payload.subdomain === subdomain;
  } catch {
    return false;
  }
};

export const isPdfAttachmentFile = async (models: IModels, key: string) => {
  const product = await models.Products.exists({
    $or: [{ 'pdfAttachment.pdf.url': key }, { 'pdfAttachment.pages.url': key }],
  });

  return Boolean(product);
};

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

  if (!paid) {
    return null;
  }

  const { pdf, pages } = product.pdfAttachment;

  return {
    pdf: pdf && signPdfFile(subdomain, pdf),
    pages: (pages || []).map((page) => signPdfFile(subdomain, page)),
  };
};
